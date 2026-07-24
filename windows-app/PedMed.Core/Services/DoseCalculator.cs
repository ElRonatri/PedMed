using PedMed.Core.Models;

namespace PedMed.Core.Services;

/// <summary>
/// Dose calculation and age-safety logic. A faithful C# port of
/// src/utils/doseCalculator.js from the React web app — keep both in sync.
/// Educational use only: every result must be verified by a clinician before
/// administering any medication to a pediatric patient.
/// </summary>
public static class DoseCalculator
{
    public static double Round(double value, int decimals = 1)
    {
        var factor = Math.Pow(10, decimals);
        return Math.Round(value * factor, MidpointRounding.AwayFromZero) / factor;
    }

    /// <summary>Determines the age-safety badge/level for a medication given the patient's age in months.</summary>
    public static AgeSafetyResult GetAgeSafety(Medication med, double? ageMonths)
    {
        if (ageMonths is null || double.IsNaN(ageMonths.Value))
        {
            return new AgeSafetyResult(
                SafetyLevel.Unknown,
                "Edad no ingresada: verifique manualmente las restricciones por edad antes de usar este medicamento.");
        }

        var age = ageMonths.Value;

        // Se prioriza la restricción más severa que aplique a la edad indicada.
        var contraindicated = med.AgeFlags.FirstOrDefault(
            f => f.Level == SafetyLevel.Contraindicated && age < f.MaxMonths);
        if (contraindicated is not null)
        {
            return new AgeSafetyResult(SafetyLevel.Contraindicated, contraindicated.Text);
        }

        var caution = med.AgeFlags.FirstOrDefault(
            f => f.Level == SafetyLevel.Caution && age < f.MaxMonths);
        if (caution is not null)
        {
            return new AgeSafetyResult(SafetyLevel.Caution, caution.Text);
        }

        return new AgeSafetyResult(SafetyLevel.Ok, "Sin restricción específica de edad para el rango indicado.");
    }

    private static DoseResult ComputeStandardDose(Medication med, double weightKg)
    {
        var rawMin = weightKg * med.MgPerKgMin!.Value;
        var rawMax = weightKg * med.MgPerKgMax!.Value;

        var singleMin = med.MaxSingleDoseMg is { } maxSingle ? Math.Min(rawMin, maxSingle) : rawMin;
        var singleMax = med.MaxSingleDoseMg is { } maxSingle2 ? Math.Min(rawMax, maxSingle2) : rawMax;

        var rawDaily = weightKg * med.MaxDailyMgPerKg!.Value;
        var dailyMax = med.MaxDailyMg is { } maxDaily ? Math.Min(rawDaily, maxDaily) : rawDaily;

        var cappedBySingleMax = med.MaxSingleDoseMg is { } ms && rawMax > ms;
        var cappedByDailyMax = med.MaxDailyMg is { } md && rawDaily > md;

        return new DoseResult
        {
            Kind = DoseType.Standard,
            SingleMin = Round(singleMin),
            SingleMax = Round(singleMax),
            DailyMax = Round(dailyMax),
            CappedBySingleMax = cappedBySingleMax,
            CappedByDailyMax = cappedByDailyMax,
            VolumeMinMl = med.ConcentrationMgPerMl is { } c1 ? Round(singleMin / c1) : null,
            VolumeMaxMl = med.ConcentrationMgPerMl is { } c2 ? Round(singleMax / c2) : null,
        };
    }

    private static DoseResult ComputeAzithromycinDose(Medication med, double weightKg)
    {
        var rawDayOne = weightKg * med.DayOneMgPerKg!.Value;
        var rawMaintenance = weightKg * med.MaintenanceMgPerKg!.Value;

        var dayOne = Math.Min(rawDayOne, med.DayOneMaxMg!.Value);
        var maintenance = Math.Min(rawMaintenance, med.MaintenanceMaxMg!.Value);

        return new DoseResult
        {
            Kind = DoseType.Azithromycin,
            DayOne = Round(dayOne),
            Maintenance = Round(maintenance),
            CappedDayOne = rawDayOne > med.DayOneMaxMg.Value,
            CappedMaintenance = rawMaintenance > med.MaintenanceMaxMg.Value,
            VolumeDayOneMl = med.ConcentrationMgPerMl is { } c1 ? Round(dayOne / c1) : null,
            VolumeMaintenanceMl = med.ConcentrationMgPerMl is { } c2 ? Round(maintenance / c2) : null,
        };
    }

    private static DoseResult ComputeWeightDose(Medication med, double weightKg)
    {
        var rawMin = weightKg * med.PerKgMin!.Value;
        var rawMax = weightKg * med.PerKgMax!.Value;

        var singleMin = med.MaxSingle is { } maxSingle ? Math.Min(rawMin, maxSingle) : rawMin;
        var singleMax = med.MaxSingle is { } maxSingle2 ? Math.Min(rawMax, maxSingle2) : rawMax;
        var cappedBySingleMax = med.MaxSingle is { } ms && rawMax > ms;

        double? dailyMax = null;
        var cappedByDailyMax = false;
        if (med.MaxDailyPerKg is { } maxDailyPerKg)
        {
            var rawDaily = weightKg * maxDailyPerKg;
            var daily = med.MaxDailyMax is { } maxDailyMax ? Math.Min(rawDaily, maxDailyMax) : rawDaily;
            cappedByDailyMax = med.MaxDailyMax is { } mdm && rawDaily > mdm;
            dailyMax = Round(daily, 2);
        }

        return new DoseResult
        {
            Kind = DoseType.WeightDose,
            Unit = med.Unit,
            SingleMin = Round(singleMin, 2),
            SingleMax = Round(singleMax, 2),
            CappedBySingleMax = cappedBySingleMax,
            DailyMax = dailyMax,
            CappedByDailyMax = cappedByDailyMax,
        };
    }

    private static DoseResult ComputeInfusionDose(Medication med, double weightKg)
    {
        var rawMin = weightKg * med.PerKgMin!.Value;
        var rawMax = weightKg * med.PerKgMax!.Value;
        var cappedByMaxRate = med.MaxRate is { } mr && rawMax > mr;
        var rateMin = med.MaxRate is { } maxRate ? Math.Min(rawMin, maxRate) : rawMin;
        var rateMax = med.MaxRate is { } maxRate2 ? Math.Min(rawMax, maxRate2) : rawMax;

        return new DoseResult
        {
            Kind = DoseType.Infusion,
            Unit = med.Unit,
            TimeUnit = med.TimeUnit,
            RateMin = Round(rateMin, 2),
            RateMax = Round(rateMax, 2),
            CappedByMaxRate = cappedByMaxRate,
        };
    }

    private static DoseResult ComputeAgeTierDose(Medication med, double? ageMonths)
    {
        if (ageMonths is null || double.IsNaN(ageMonths.Value))
        {
            return new DoseResult { Kind = DoseType.AgeTier, DoseText = null, NeedsAge = true };
        }

        var age = ageMonths.Value;
        var tiers = med.AgeTiers!;
        var tier = tiers.FirstOrDefault(t => age < t.MaxMonths) ?? tiers[^1];
        return new DoseResult { Kind = DoseType.AgeTier, DoseText = tier.DoseText, NeedsAge = false };
    }

    private static DoseResult ComputeWeightTierDose(Medication med, double weightKg)
    {
        var tiers = med.WeightTiers!;
        var tier = tiers.FirstOrDefault(t => weightKg < t.MaxKg) ?? tiers[^1];
        return new DoseResult { Kind = DoseType.WeightTier, DoseText = tier.DoseText };
    }

    private static DoseResult ComputeFixedDose(Medication med)
    {
        return new DoseResult { Kind = DoseType.Fixed, DoseText = med.DoseText };
    }

    /// <summary>
    /// Computes the dose result for a medication given the patient's weight (kg) and
    /// optional age (months). Age is only required for DoseType.AgeTier.
    /// </summary>
    public static DoseResult Compute(Medication med, double weightKg, double? ageMonths = null)
    {
        return med.DoseType switch
        {
            DoseType.Azithromycin => ComputeAzithromycinDose(med, weightKg),
            DoseType.WeightDose => ComputeWeightDose(med, weightKg),
            DoseType.Infusion => ComputeInfusionDose(med, weightKg),
            DoseType.AgeTier => ComputeAgeTierDose(med, ageMonths),
            DoseType.WeightTier => ComputeWeightTierDose(med, weightKg),
            DoseType.Fixed => ComputeFixedDose(med),
            _ => ComputeStandardDose(med, weightKg),
        };
    }
}
