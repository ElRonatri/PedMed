using System.Collections.ObjectModel;
using System.Globalization;
using System.Windows.Media;
using PedMed.Core.Models;
using PedMed.Core.Services;
using PedMed.Windows.Theme;

namespace PedMed.Windows.ViewModels;

/// <summary>
/// View-model for a single medication card. Mirrors src/components/MedicationCard.jsx
/// from the web app: given the panel's current weight/age (via <see cref="Refresh"/>),
/// it computes the safety badge, the ribbon (hospital/controlled), and the dose rows to
/// display for whichever DoseType this medication uses.
/// </summary>
public sealed class MedicationCardViewModel : ViewModelBase
{
    public Medication Med { get; }

    public string Name => Med.Name;
    public string Indication => Med.Indication;
    public string GeneralWarning => Med.GeneralWarning;
    public IReadOnlyList<MedicationSource> Sources => Med.Sources;
    public bool HasSources => Med.Sources.Count > 0;
    public bool HasRibbon => RibbonText is not null;
    public string? RibbonText { get; }
    public Brush RibbonBackground { get; }
    public Brush RibbonForeground { get; }

    public ObservableCollection<DoseLineViewModel> DoseLines { get; } = new();

    private string _safetyLabel = "";
    public string SafetyLabel { get => _safetyLabel; private set => SetField(ref _safetyLabel, value); }

    private string _safetyText = "";
    public string SafetyText { get => _safetyText; private set => SetField(ref _safetyText, value); }

    private Brush _safetyBadgeBackground = Brushes.Transparent;
    public Brush SafetyBadgeBackground { get => _safetyBadgeBackground; private set => SetField(ref _safetyBadgeBackground, value); }

    private Brush _safetyBadgeForeground = Brushes.Black;
    public Brush SafetyBadgeForeground { get => _safetyBadgeForeground; private set => SetField(ref _safetyBadgeForeground, value); }

    private Brush _safetyTextColor = Brushes.Black;
    public Brush SafetyTextColor { get => _safetyTextColor; private set => SetField(ref _safetyTextColor, value); }

    private Brush _cardBorderBrush = Brushes.Gray;
    public Brush CardBorderBrush { get => _cardBorderBrush; private set => SetField(ref _cardBorderBrush, value); }

    private bool _hasDose;
    public bool HasDose { get => _hasDose; private set => SetField(ref _hasDose, value); }

    private string? _placeholder;
    public string? Placeholder { get => _placeholder; private set => SetField(ref _placeholder, value); }
    public bool HasPlaceholder => !string.IsNullOrEmpty(Placeholder);

    public MedicationCardViewModel(Medication med)
    {
        Med = med;
        (RibbonText, RibbonBackground, RibbonForeground) = ComputeRibbon(med.Setting);
    }

    private static (string? Text, Brush Background, Brush Foreground) ComputeRibbon(string? setting) => setting switch
    {
        "hospital" => (
            "SOLO USO HOSPITALARIO — REQUIERE VÍA IV/IM/IO, MONITORIZACIÓN CONTINUA Y PERSONAL CAPACITADO",
            FromHex("#2b1230"), FromHex("#f4d9ff")),
        "controlled" => (
            "MEDICAMENTO CONTROLADO — REQUIERE PRESCRIPCIÓN Y SUPERVISIÓN MÉDICA ESTRICTA; RIESGO DE DEPENDENCIA/DEPRESIÓN RESPIRATORIA",
            FromHex("#3a2210"), FromHex("#ffe1bf")),
        _ => (null, Brushes.Transparent, Brushes.Black),
    };

    /// <summary>Recomputes everything this card displays for the panel's current weight (kg) and age (months).</summary>
    public void Refresh(double? weightKg, double? ageMonths, double? gestationalWeeks = null, double? postnatalDays = null)
    {
        var safety = DoseCalculator.GetAgeSafety(Med, ageMonths);
        SafetyLabel = safety.Level switch
        {
            SafetyLevel.Ok => "SIN RESTRICCIÓN POR EDAD",
            SafetyLevel.Caution => "PRECAUCIÓN",
            SafetyLevel.Contraindicated => "CONTRAINDICADO",
            _ => "EDAD NO ESPECIFICADA",
        };
        SafetyText = safety.Text;

        var dark = ThemeService.IsDarkMode;
        var (badgeBg, badgeFg, textColor, borderColor) = safety.Level switch
        {
            SafetyLevel.Ok => (FromHex(dark ? "#123322" : "#e6f6ec"), FromHex("#1f8a4c"), FromHex("#1f8a4c"), FromHex("#1f8a4c")),
            SafetyLevel.Caution => (FromHex(dark ? "#3a2c10" : "#fdf1dc"), FromHex("#b8790a"), FromHex("#b8790a"), FromHex("#b8790a")),
            SafetyLevel.Contraindicated => (FromHex(dark ? "#3a1616" : "#fbe6e6"), FromHex("#c53030"), FromHex("#c53030"), FromHex("#c53030")),
            _ => (FromHex(dark ? "#262f38" : "#eef0f2"), FromHex("#6b7280"), FromHex("#6b7280"), FromHex("#6b7280")),
        };
        SafetyBadgeBackground = badgeBg;
        SafetyBadgeForeground = badgeFg;
        SafetyTextColor = textColor;
        CardBorderBrush = borderColor;

        DoseLines.Clear();

        // AgeTier y Fixed no dependen del peso (solo edad, o nada).
        if (Med.DoseType == DoseType.AgeTier)
        {
            var dose = DoseCalculator.Compute(Med, weightKg ?? 0, ageMonths);
            if (dose.NeedsAge)
            {
                Placeholder = "Ingrese la edad del paciente para ver la dosis correspondiente.";
                HasDose = false;
            }
            else
            {
                Placeholder = null;
                DoseLines.Add(new DoseLineViewModel("Dosis según edad", dose.DoseText ?? ""));
                HasDose = true;
            }
            return;
        }

        if (Med.DoseType == DoseType.Fixed)
        {
            var dose = DoseCalculator.Compute(Med, weightKg ?? 0, ageMonths);
            Placeholder = null;
            DoseLines.Add(new DoseLineViewModel("Dosis", dose.DoseText ?? ""));
            HasDose = true;
            return;
        }

        if (Med.DoseType == DoseType.NeonatalTier)
        {
            var dose = DoseCalculator.Compute(Med, weightKg ?? 0, ageMonths, gestationalWeeks, postnatalDays);
            if (dose.NeedsInput)
            {
                Placeholder = "Ingrese la edad gestacional y la edad postnatal para ver la dosis correspondiente.";
                HasDose = false;
                return;
            }
            Placeholder = null;
            HasDose = true;
            DoseLines.Add(new DoseLineViewModel("Frecuencia según tramo", dose.FrequencyText ?? ""));
            if (dose.NeedsWeight)
            {
                DoseLines.Add(new DoseLineViewModel("Dosis", $"Ingrese el peso actual para calcular la dosis en {dose.Unit}."));
            }
            else
            {
                DoseLines.Add(new DoseLineViewModel(
                    "Dosis por administración",
                    RangeOrSingle(dose.DoseMin, dose.DoseMax, dose.Unit ?? "") + CappedNote(dose.Capped)));
            }
            return;
        }

        if (Med.DoseType == DoseType.NeonatalWeightTier)
        {
            var dose = DoseCalculator.Compute(Med, weightKg ?? 0, ageMonths, gestationalWeeks, postnatalDays);
            if (dose.NeedsInput)
            {
                Placeholder = "Ingrese el peso actual y la edad postnatal para ver la dosis correspondiente.";
                HasDose = false;
                return;
            }
            Placeholder = null;
            HasDose = true;
            DoseLines.Add(new DoseLineViewModel("Frecuencia según tramo", dose.FrequencyText ?? ""));
            DoseLines.Add(new DoseLineViewModel(
                "Dosis por administración",
                RangeOrSingle(dose.DoseMin, dose.DoseMax, dose.Unit ?? "") + CappedNote(dose.Capped)));
            return;
        }

        var hasWeight = weightKg is > 0;
        if (!hasWeight)
        {
            Placeholder = "Ingrese el peso del paciente para calcular la dosis.";
            HasDose = false;
            return;
        }

        Placeholder = null;
        HasDose = true;
        var d = DoseCalculator.Compute(Med, weightKg!.Value, ageMonths);

        switch (d.Kind)
        {
            case DoseType.Standard:
                DoseLines.Add(new DoseLineViewModel(
                    "Dosis por administración",
                    RangeOrSingle(d.SingleMin, d.SingleMax, "mg") + CappedNote(d.CappedBySingleMax)));
                if (Med.ConcentrationMgPerMl is not null)
                {
                    DoseLines.Add(new DoseLineViewModel(
                        $"Equivalente en suspensión ({Med.ConcentrationLabel})",
                        RangeOrSingle(d.VolumeMinMl, d.VolumeMaxMl, "mL")));
                }
                DoseLines.Add(new DoseLineViewModel("Frecuencia", Med.FrequencyText));
                DoseLines.Add(new DoseLineViewModel(
                    "Dosis máxima diaria",
                    $"{Fmt(d.DailyMax)} mg/día" + CappedNote(d.CappedByDailyMax)));
                break;

            case DoseType.Azithromycin:
                var dayOneVol = Med.ConcentrationMgPerMl is not null ? $" ({Fmt(d.VolumeDayOneMl)} mL)" : "";
                DoseLines.Add(new DoseLineViewModel(
                    "Día 1 (dosis de carga)", $"{Fmt(d.DayOne)} mg{dayOneVol}" + CappedNote(d.CappedDayOne)));
                var maintVol = Med.ConcentrationMgPerMl is not null ? $" ({Fmt(d.VolumeMaintenanceMl)} mL)" : "";
                DoseLines.Add(new DoseLineViewModel(
                    "Días 2–5 (mantenimiento)", $"{Fmt(d.Maintenance)} mg{maintVol}" + CappedNote(d.CappedMaintenance)));
                DoseLines.Add(new DoseLineViewModel("Frecuencia", Med.FrequencyText));
                break;

            case DoseType.WeightDose:
                DoseLines.Add(new DoseLineViewModel(
                    "Dosis por administración",
                    RangeOrSingle(d.SingleMin, d.SingleMax, d.Unit ?? "") + CappedNote(d.CappedBySingleMax)));
                DoseLines.Add(new DoseLineViewModel("Vía / Frecuencia", Med.FrequencyText));
                if (d.DailyMax is not null)
                {
                    DoseLines.Add(new DoseLineViewModel(
                        "Dosis máxima diaria",
                        $"{Fmt(d.DailyMax)} {d.Unit}/día" + CappedNote(d.CappedByDailyMax)));
                }
                break;

            case DoseType.Infusion:
                DoseLines.Add(new DoseLineViewModel(
                    "Tasa para este paciente",
                    RangeOrSingle(d.RateMin, d.RateMax, $"{d.Unit}/{d.TimeUnit}") + CappedNote(d.CappedByMaxRate)));
                DoseLines.Add(new DoseLineViewModel("Vía / Preparación", Med.FrequencyText));
                DoseLines.Add(new DoseLineViewModel(
                    "Nota",
                    "No se calcula mL/h: depende de la concentración de preparación de la infusión según protocolo institucional."));
                break;

            case DoseType.WeightTier:
                DoseLines.Add(new DoseLineViewModel("Dosis según peso", d.DoseText ?? ""));
                break;
        }
    }

    private static string RangeOrSingle(double? min, double? max, string unit)
    {
        if (min is null || max is null) return "";
        return Math.Abs(min.Value - max.Value) < 0.0001
            ? $"{Fmt(min)} {unit}".TrimEnd()
            : $"{Fmt(min)} – {Fmt(max)} {unit}".TrimEnd();
    }

    private static string CappedNote(bool capped) => capped ? " (tope máximo aplicado)" : "";

    private static string Fmt(double? v) => v?.ToString("0.##", CultureInfo.InvariantCulture) ?? "";

    private static SolidColorBrush FromHex(string hex)
    {
        var brush = (SolidColorBrush)new BrushConverter().ConvertFromString(hex)!;
        brush.Freeze();
        return brush;
    }
}
