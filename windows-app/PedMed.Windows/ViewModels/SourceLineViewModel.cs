namespace PedMed.Windows.ViewModels;

/// <summary>A single source citation shown at the bottom of a medication card.
/// Some sources (e.g. a user-provided PDF with no public URL) have no link and
/// must render as plain text instead of a hyperlink.</summary>
public sealed record SourceLineViewModel(string Label, string? Url)
{
    public bool HasUrl => !string.IsNullOrEmpty(Url);
    public bool HasNoUrl => !HasUrl;
}
