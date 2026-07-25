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

    /// <summary>Formatea el rango de dosis por kg usado en el cálculo, ej. "10 – 15 mg/kg".</summary>
    private static string FormatPerKgFormula(double min, double max, string unit)
    {
        return Math.Abs(min - max) < 0.0001
            ? $"{FmtNum(min)} {unit}"
            : $"{FmtNum(min)} – {FmtNum(max)} {unit}";
    }

    private static string FmtNum(double v) =>
        v.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture);

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
            Formula = FormatPerKgFormula(med.MgPerKgMin!.Value, med.MgPerKgMax!.Value, "mg/kg"),
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
            DayOneFormula = FormatPerKgFormula(med.DayOneMgPerKg!.Value, med.DayOneMgPerKg!.Value, "mg/kg"),
            MaintenanceFormula = FormatPerKgFormula(med.MaintenanceMgPerKg!.Value, med.MaintenanceMgPerKg!.Value, "mg/kg"),
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
            Formula = FormatPerKgFormula(med.PerKgMin!.Value, med.PerKgMax!.Value, $"{med.Unit}/kg"),
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
            Formula = FormatPerKgFormula(med.PerKgMin!.Value, med.PerKgMax!.Value, $"{med.Unit}/kg/{med.TimeUnit}"),
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
    /// Selects the mg/kg (or other unit) dose and frequency according to the tier whose
    /// gestational age at birth (weeks) and postnatal age (days) both exceed the patient's
    /// values — both dimensions at once, since neonatal dosing depends on both. Tiers are
    /// tried in declaration order and the first one whose upper bound in BOTH dimensions
    /// exceeds the patient's values is used (same "first match" rule as AgeTier/WeightTier,
    /// extended to 2D).
    /// </summary>
    private static DoseResult ComputeNeonatalTierDose(Medication med, double? weightKg, double? gestationalWeeks, double? postnatalDays)
    {
        if (gestationalWeeks is null || double.IsNaN(gestationalWeeks.Value) ||
            postnatalDays is null || double.IsNaN(postnatalDays.Value))
        {
            return new DoseResult { Kind = DoseType.NeonatalTier, NeedsInput = true };
        }

        var tiers = med.NeonatalTiers!;
        var tier = tiers.FirstOrDefault(t => gestationalWeeks.Value < t.MaxGestationalWeeks && postnatalDays.Value < t.MaxPostnatalDays)
                   ?? tiers[^1];

        var hasWeight = weightKg is > 0;
        double? rawMin = hasWeight ? weightKg!.Value * tier.PerKgMin : null;
        double? rawMax = hasWeight ? weightKg!.Value * tier.PerKgMax : null;
        var doseMin = rawMin is { } rMin && tier.MaxSingle is { } msMin ? Math.Min(rMin, msMin) : rawMin;
        var doseMax = rawMax is { } rMax && tier.MaxSingle is { } msMax ? Math.Min(rMax, msMax) : rawMax;
        var capped = hasWeight && tier.MaxSingle is { } ms2 && rawMax > ms2;

        return new DoseResult
        {
            Kind = DoseType.NeonatalTier,
            NeedsInput = false,
            NeedsWeight = !hasWeight,
            Formula = FormatPerKgFormula(tier.PerKgMin, tier.PerKgMax, $"{med.Unit}/kg"),
            DoseMin = doseMin is { } dMin ? Round(dMin, 2) : null,
            DoseMax = doseMax is { } dMax ? Round(dMax, 2) : null,
            Unit = med.Unit,
            FrequencyText = tier.FrequencyText,
            Capped = capped,
        };
    }

    /// <summary>
    /// Same as <see cref="ComputeNeonatalTierDose"/>, but for medications whose source
    /// table tiers by CURRENT weight (not gestational age) — reuses the already-entered
    /// weight both to select the tier and to compute the dose.
    /// </summary>
    private static DoseResult ComputeNeonatalWeightTierDose(Medication med, double? weightKg, double? postnatalDays)
    {
        var hasWeight = weightKg is > 0;
        if (!hasWeight || postnatalDays is null || double.IsNaN(postnatalDays.Value))
        {
            return new DoseResult { Kind = DoseType.NeonatalWeightTier, NeedsInput = true, NeedsWeight = !hasWeight };
        }

        var tiers = med.NeonatalWeightTiers!;
        var tier = tiers.FirstOrDefault(t => weightKg!.Value < t.MaxWeightKg && postnatalDays.Value < t.MaxPostnatalDays)
                   ?? tiers[^1];

        var rawMin = weightKg!.Value * tier.PerKgMin;
        var rawMax = weightKg.Value * tier.PerKgMax;
        var doseMin = tier.MaxSingle is { } msMin ? Math.Min(rawMin, msMin) : rawMin;
        var doseMax = tier.MaxSingle is { } msMax ? Math.Min(rawMax, msMax) : rawMax;
        var capped = tier.MaxSingle is { } ms2 && rawMax > ms2;

        return new DoseResult
        {
            Kind = DoseType.NeonatalWeightTier,
            NeedsInput = false,
            NeedsWeight = false,
            Formula = FormatPerKgFormula(tier.PerKgMin, tier.PerKgMax, $"{med.Unit}/kg"),
            DoseMin = Round(doseMin, 2),
            DoseMax = Round(doseMax, 2),
            Unit = med.Unit,
            FrequencyText = tier.FrequencyText,
            Capped = capped,
        };
    }

    /// <summary>
    /// Computes the dose result for a medication given the patient's weight (kg) and
    /// optional age (months). Age is only required for DoseType.AgeTier. Gestational
    /// weeks and postnatal days are only required for DoseType.NeonatalTier /
    /// DoseType.NeonatalWeightTier — pass weightKg as 0 (or any non-positive value) when
    /// the weight has not been entered yet, mirroring the "no weight yet" sentinel already
    /// used for AgeTier/Fixed by the view-model.
    /// </summary>
    public static DoseResult Compute(
        Medication med,
        double weightKg,
        double? ageMonths = null,
        double? gestationalWeeks = null,
        double? postnatalDays = null)
    {
        return med.DoseType switch
        {
            DoseType.Azithromycin => ComputeAzithromycinDose(med, weightKg),
            DoseType.WeightDose => ComputeWeightDose(med, weightKg),
            DoseType.Infusion => ComputeInfusionDose(med, weightKg),
            DoseType.AgeTier => ComputeAgeTierDose(med, ageMonths),
            DoseType.WeightTier => ComputeWeightTierDose(med, weightKg),
            DoseType.Fixed => ComputeFixedDose(med),
            DoseType.NeonatalTier => ComputeNeonatalTierDose(med, weightKg > 0 ? weightKg : null, gestationalWeeks, postnatalDays),
            DoseType.NeonatalWeightTier => ComputeNeonatalWeightTierDose(med, weightKg > 0 ? weightKg : null, postnatalDays),
            _ => ComputeStandardDose(med, weightKg),
        };
    }
}
