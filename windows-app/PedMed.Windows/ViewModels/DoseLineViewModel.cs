namespace PedMed.Windows.ViewModels;

/// <summary>A single label/value row inside a medication card's dose block.</summary>
public sealed record DoseLineViewModel(string Label, string Value);
