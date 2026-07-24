using System.Collections.ObjectModel;
using System.Globalization;
using PedMed.Core.Models;
using PedMed.Windows.Theme;
using PedMed.Windows.Utils;

namespace PedMed.Windows.ViewModels;

/// <summary>
/// One independent calculator: its own weight/age inputs plus the medication cards
/// they drive. Mirrors src/components/DoseCalculatorPanel.jsx — the web app renders
/// one instance per tab (Principal, Hospitalización) with no shared state between them,
/// and this view-model does the same.
/// </summary>
public sealed class PatientPanelViewModel : ViewModelBase
{
    private const int MaxSuggestions = 8;

    private readonly List<MedicationCardViewModel> _allCards;
    private readonly IReadOnlyList<string> _categoryOrder;

    public ObservableCollection<CategoryGroupViewModel> Categories { get; } = new();
    public ObservableCollection<MedicationCardViewModel> Suggestions { get; } = new();
    public IReadOnlyList<string> AgeUnits { get; } = new[] { "meses", "años" };

    private string _searchText = "";
    public string SearchText
    {
        get => _searchText;
        set
        {
            if (SetField(ref _searchText, value))
            {
                OnPropertyChanged(nameof(HasSearchText));
                RebuildCategories();
            }
        }
    }

    public bool HasSearchText => !string.IsNullOrEmpty(SearchText);

    private int _matchCount;
    public int MatchCount { get => _matchCount; private set => SetField(ref _matchCount, value); }

    private bool _isSuggestionsOpen;
    public bool IsSuggestionsOpen { get => _isSuggestionsOpen; set => SetField(ref _isSuggestionsOpen, value); }

    private string _weightText = "";
    public string WeightText
    {
        get => _weightText;
        set
        {
            if (SetField(ref _weightText, value)) RecomputeAll();
        }
    }

    private string _ageText = "";
    public string AgeText
    {
        get => _ageText;
        set
        {
            if (SetField(ref _ageText, value)) RecomputeAll();
        }
    }

    private string _ageUnit = "meses";
    public string AgeUnit
    {
        get => _ageUnit;
        set
        {
            if (SetField(ref _ageUnit, value)) RecomputeAll();
        }
    }

    private string? _formError;
    public string? FormError { get => _formError; private set => SetField(ref _formError, value); }
    public bool HasFormError => !string.IsNullOrEmpty(FormError);

    public PatientPanelViewModel(IEnumerable<Medication> medications, IReadOnlyList<string> categoryOrder)
    {
        _allCards = medications.Select(m => new MedicationCardViewModel(m)).ToList();
        _categoryOrder = categoryOrder;

        RebuildCategories();
        ThemeService.ThemeChanged += RecomputeAll;
        RecomputeAll();
    }

    /// <summary>Re-filters _allCards by SearchText and regroups the surviving cards by
    /// category, mirroring DoseCalculatorPanel.jsx's per-render filter+group logic.</summary>
    private void RebuildCategories()
    {
        var matches = _allCards.Where(c => MedicationSearch.Matches(c.Name, SearchText)).ToList();
        MatchCount = matches.Count;

        Categories.Clear();
        foreach (var category in _categoryOrder)
        {
            var cardsInCategory = matches.Where(c => c.Med.Category == category).ToList();
            if (cardsInCategory.Count == 0) continue;
            Categories.Add(new CategoryGroupViewModel(category, cardsInCategory));
        }

        Suggestions.Clear();
        if (HasSearchText)
        {
            foreach (var card in matches.Take(MaxSuggestions))
            {
                Suggestions.Add(card);
            }
        }
        IsSuggestionsOpen = HasSearchText && Suggestions.Count > 0;
    }

    /// <summary>Selects a suggestion: narrows the search to its exact name so its card
    /// is the (or one of the few) result(s) shown, and closes the suggestions popup.</summary>
    public void SelectSuggestion(MedicationCardViewModel card)
    {
        SearchText = card.Name;
        IsSuggestionsOpen = false;
    }

    private void RecomputeAll()
    {
        double? weightKg = double.TryParse(WeightText, NumberStyles.Any, CultureInfo.InvariantCulture, out var w)
            ? w
            : null;

        var weightIsInvalid = !string.IsNullOrEmpty(WeightText) && (weightKg is null || weightKg <= 0 || weightKg > 150);
        FormError = weightIsInvalid
            ? "Ingrese un peso válido en kilogramos (mayor que 0 y hasta 150)."
            : null;

        double? ageMonths = null;
        if (double.TryParse(AgeText, NumberStyles.Any, CultureInfo.InvariantCulture, out var a) && a >= 0)
        {
            ageMonths = AgeUnit == "años" ? a * 12 : a;
        }

        var effectiveWeight = weightIsInvalid ? null : weightKg;

        foreach (var card in _allCards)
        {
            card.Refresh(effectiveWeight, ageMonths);
        }
    }
}
