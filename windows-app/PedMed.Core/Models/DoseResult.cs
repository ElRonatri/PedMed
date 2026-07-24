namespace PedMed.Core.Models;

/// <summary>Result of GetAgeSafety: the badge level shown on a medication card plus its explanation.</summary>
public sealed record AgeSafetyResult(SafetyLevel Level, string Text);

/// <summary>
/// Discriminated result of DoseCalculator.Compute. Exactly one of the type-specific
/// property groups is populated, matching <see cref="Medication.DoseType"/>.
/// </summary>
public sealed class DoseResult
{
    public required DoseType Kind { get; init; }

    // Standard
    public double? SingleMin { get; init; }
    public double? SingleMax { get; init; }
    public double? DailyMax { get; init; }
    public bool CappedBySingleMax { get; init; }
    public bool CappedByDailyMax { get; init; }
    public double? VolumeMinMl { get; init; }
    public double? VolumeMaxMl { get; init; }

    // Azithromycin
    public double? DayOne { get; init; }
    public double? Maintenance { get; init; }
    public bool CappedDayOne { get; init; }
    public bool CappedMaintenance { get; init; }
    public double? VolumeDayOneMl { get; init; }
    public double? VolumeMaintenanceMl { get; init; }

    // WeightDose / Infusion share Unit
    public string? Unit { get; init; }

    // Infusion
    public string? TimeUnit { get; init; }
    public double? RateMin { get; init; }
    public double? RateMax { get; init; }
    public bool CappedByMaxRate { get; init; }

    // AgeTier
    public bool NeedsAge { get; init; }

    // AgeTier / WeightTier / Fixed
    public string? DoseText { get; init; }

    // NeonatalTier / NeonatalWeightTier
    public bool NeedsInput { get; init; }
    public bool NeedsWeight { get; init; }
    public double? DoseMin { get; init; }
    public double? DoseMax { get; init; }
    public bool Capped { get; init; }
    public string? FrequencyText { get; init; }
}
