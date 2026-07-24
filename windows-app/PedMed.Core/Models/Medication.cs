namespace PedMed.Core.Models;

public enum DoseType
{
    Standard,
    WeightDose,
    Azithromycin,
    Infusion,
    AgeTier,
    WeightTier,
    Fixed,
    NeonatalTier,
    NeonatalWeightTier,
}

public enum SafetyLevel
{
    Unknown,
    Ok,
    Caution,
    Contraindicated,
}

public sealed record MedicationSource(string Label, string? Url = null);

/// <summary>
/// A single age-based safety restriction. Applies when the patient's age in months
/// is less than <see cref="MaxMonths"/>.
/// </summary>
public sealed record AgeFlag(double MaxMonths, SafetyLevel Level, string Text);

/// <summary>Fixed dose text selected by age band (used by DoseType.AgeTier).</summary>
public sealed record AgeTierEntry(double MaxMonths, string DoseText);

/// <summary>Fixed dose text selected by weight band (used by DoseType.WeightTier).</summary>
public sealed record WeightTierEntry(double MaxKg, string DoseText);

/// <summary>
/// A neonatal dosing tier selected by BOTH gestational age at birth (weeks) and
/// postnatal age (days) at once (used by DoseType.NeonatalTier). Applies when the
/// patient's gestational age is less than <see cref="MaxGestationalWeeks"/> AND the
/// postnatal age is less than <see cref="MaxPostnatalDays"/> — tiers are evaluated in
/// declaration order, first match wins (same "first match" rule as AgeTier/WeightTier,
/// extended to two dimensions).
/// </summary>
public sealed record NeonatalTierEntry(
    double MaxGestationalWeeks,
    double MaxPostnatalDays,
    double PerKgMin,
    double PerKgMax,
    string FrequencyText,
    double? MaxSingle = null);

/// <summary>
/// Same as <see cref="NeonatalTierEntry"/>, but for source tables that tier by CURRENT
/// weight (kg) instead of gestational age (used by DoseType.NeonatalWeightTier) — reuses
/// the patient's already-entered weight both to select the tier and to compute the dose.
/// </summary>
public sealed record NeonatalWeightTierEntry(
    double MaxWeightKg,
    double MaxPostnatalDays,
    double PerKgMin,
    double PerKgMax,
    string FrequencyText,
    double? MaxSingle = null);

/// <summary>
/// A single medication entry. Mirrors the shape of src/data/medications.js in the
/// React web app, field for field, so both apps stay in sync from the same source
/// data. Not every field applies to every DoseType — see DoseCalculator for which
/// fields each dose type reads.
/// </summary>
public sealed class Medication
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Category { get; init; }
    public required DoseType DoseType { get; init; }

    /// <summary>"hospital" routes the medication to the Hospitalización/UCI/Quirófano tab; otherwise Principal.</summary>
    public string? Venue { get; init; }

    /// <summary>"hospital" or "controlled" — drives the ribbon shown on the card.</summary>
    public string? Setting { get; init; }

    // --- DoseType.Standard (legacy mg/kg model with optional mL suspension conversion) ---
    public double? MgPerKgMin { get; init; }
    public double? MgPerKgMax { get; init; }
    public double? MaxSingleDoseMg { get; init; }
    public double? MaxDailyMgPerKg { get; init; }
    public double? MaxDailyMg { get; init; }
    public double? ConcentrationMgPerMl { get; init; }
    public string? ConcentrationLabel { get; init; }

    // --- DoseType.WeightDose (generalized per-kg dose, arbitrary unit) ---
    public string? Unit { get; init; }
    public double? PerKgMin { get; init; }
    public double? PerKgMax { get; init; }
    public double? MaxSingle { get; init; }
    public double? MaxDailyPerKg { get; init; }
    public double? MaxDailyMax { get; init; }

    // --- DoseType.Azithromycin (two-phase loading/maintenance) ---
    public double? DayOneMgPerKg { get; init; }
    public double? DayOneMaxMg { get; init; }
    public double? MaintenanceMgPerKg { get; init; }
    public double? MaintenanceMaxMg { get; init; }

    // --- DoseType.Infusion (continuous rate, e.g. mcg/kg/min) ---
    public string? TimeUnit { get; init; }
    public double? MaxRate { get; init; }

    // --- DoseType.AgeTier / DoseType.WeightTier ---
    public IReadOnlyList<AgeTierEntry>? AgeTiers { get; init; }
    public IReadOnlyList<WeightTierEntry>? WeightTiers { get; init; }

    // --- DoseType.NeonatalTier / DoseType.NeonatalWeightTier ---
    public IReadOnlyList<NeonatalTierEntry>? NeonatalTiers { get; init; }
    public IReadOnlyList<NeonatalWeightTierEntry>? NeonatalWeightTiers { get; init; }

    // --- DoseType.Fixed ---
    public string? DoseText { get; init; }

    public required string FrequencyText { get; init; }
    public required string Indication { get; init; }
    public IReadOnlyList<AgeFlag> AgeFlags { get; init; } = Array.Empty<AgeFlag>();
    public required string GeneralWarning { get; init; }
    public IReadOnlyList<MedicationSource> Sources { get; init; } = Array.Empty<MedicationSource>();

    public bool IsHospitalVenue => Venue == "hospital";
    public bool IsNeonatalVenue => Venue == "neonatal";
}
