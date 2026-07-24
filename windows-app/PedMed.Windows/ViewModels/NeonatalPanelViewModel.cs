using System.Collections.ObjectModel;
using System.Globalization;
using PedMed.Core.Models;
using PedMed.Windows.Theme;

namespace PedMed.Windows.ViewModels;

/// <summary>
/// Independent calculator for the Neonatología tab: weight + gestational age at birth
/// (weeks) + postnatal age (days), driving the medication cards for DoseType.NeonatalTier
/// / DoseType.NeonatalWeightTier. Mirrors src/components/NeonatalCalculatorPanel.jsx.
/// </summary>
public sealed class NeonatalPanelViewModel : ViewModelBase
{
    private readonly List<MedicationCardViewModel> _allCards;

    // Días promedio por mes, usados solo para derivar una edad en meses a partir de la
    // edad postnatal (días) y así reutilizar GetAgeSafety/AgeFlags (definidos en meses).
    private const double DaysPerMonth = 30.44;

    public ObservableCollection<CategoryGroupViewModel> Categories { get; } = new();

    private string _weightText = "";
    public string WeightText
    {
        get => _weightText;
        set { if (SetField(ref _weightText, value)) RecomputeAll(); }
    }

    private string _gestationalWeeksText = "";
    public string GestationalWeeksText
    {
        get => _gestationalWeeksText;
        set { if (SetField(ref _gestationalWeeksText, value)) RecomputeAll(); }
    }

    private string _postnatalDaysText = "";
    public string PostnatalDaysText
    {
        get => _postnatalDaysText;
        set { if (SetField(ref _postnatalDaysText, value)) RecomputeAll(); }
    }

    private string? _weightError;
    public string? WeightError { get => _weightError; private set => SetField(ref _weightError, value); }
    public bool HasWeightError => !string.IsNullOrEmpty(WeightError);

    private string? _gestationalError;
    public string? GestationalError { get => _gestationalError; private set => SetField(ref _gestationalError, value); }
    public bool HasGestationalError => !string.IsNullOrEmpty(GestationalError);

    private string? _postnatalError;
    public string? PostnatalError { get => _postnatalError; private set => SetField(ref _postnatalError, value); }
    public bool HasPostnatalError => !string.IsNullOrEmpty(PostnatalError);

    public NeonatalPanelViewModel(IEnumerable<Medication> medications, IReadOnlyList<string> categoryOrder)
    {
        _allCards = medications.Select(m => new MedicationCardViewModel(m)).ToList();

        foreach (var category in categoryOrder)
        {
            var cardsInCategory = _allCards.Where(c => c.Med.Category == category).ToList();
            if (cardsInCategory.Count == 0) continue;
            Categories.Add(new CategoryGroupViewModel(category, cardsInCategory));
        }

        ThemeService.ThemeChanged += RecomputeAll;
        RecomputeAll();
    }

    private void RecomputeAll()
    {
        double? weightKg = double.TryParse(WeightText, NumberStyles.Any, CultureInfo.InvariantCulture, out var w)
            ? w
            : null;
        var weightIsInvalid = !string.IsNullOrEmpty(WeightText) && (weightKg is null || weightKg <= 0 || weightKg > 8);
        WeightError = weightIsInvalid ? "Ingrese un peso válido en kilogramos (mayor que 0 y hasta 8)." : null;

        double? gestationalWeeks = double.TryParse(GestationalWeeksText, NumberStyles.Any, CultureInfo.InvariantCulture, out var g)
            ? g
            : null;
        var gestationalIsInvalid = !string.IsNullOrEmpty(GestationalWeeksText) &&
                                    (gestationalWeeks is null || gestationalWeeks < 20 || gestationalWeeks > 45);
        GestationalError = gestationalIsInvalid
            ? "Ingrese una edad gestacional válida en semanas (entre 20 y 45)."
            : null;

        double? postnatalDays = double.TryParse(PostnatalDaysText, NumberStyles.Any, CultureInfo.InvariantCulture, out var p)
            ? p
            : null;
        var postnatalIsInvalid = !string.IsNullOrEmpty(PostnatalDaysText) && (postnatalDays is null || postnatalDays < 0);
        PostnatalError = postnatalIsInvalid ? "Ingrese una edad postnatal válida en días (0 o mayor)." : null;

        var effectiveWeight = weightIsInvalid ? null : weightKg;
        var effectiveGestational = gestationalIsInvalid ? null : gestationalWeeks;
        var effectivePostnatal = postnatalIsInvalid ? null : postnatalDays;
        double? ageMonths = effectivePostnatal is { } pd ? pd / DaysPerMonth : null;

        foreach (var card in _allCards)
        {
            card.Refresh(effectiveWeight, ageMonths, effectiveGestational, effectivePostnatal);
        }
    }
}
