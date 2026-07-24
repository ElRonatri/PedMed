namespace PedMed.Windows.ViewModels;

public sealed class CategoryGroupViewModel
{
    public string Name { get; }
    public IReadOnlyList<MedicationCardViewModel> Cards { get; }

    public CategoryGroupViewModel(string name, IReadOnlyList<MedicationCardViewModel> cards)
    {
        Name = name;
        Cards = cards;
    }
}
