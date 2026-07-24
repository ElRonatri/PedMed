using System.Globalization;
using System.Text;

namespace PedMed.Windows.Utils;

/// <summary>
/// Text matching for the medication search box. A C# port of
/// src/utils/searchMedications.js — keep both in sync.
/// </summary>
public static class MedicationSearch
{
    /// <summary>Lowercases and strips diacritics so "amoxicilina" matches "Amoxicilina/Ácido Clavulánico".</summary>
    public static string Normalize(string value)
    {
        var decomposed = value.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(decomposed.Length);
        foreach (var c in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }
        return sb.ToString().ToLowerInvariant().Trim();
    }

    public static bool Matches(string name, string query)
    {
        var normalizedQuery = Normalize(query);
        return normalizedQuery.Length == 0 || Normalize(name).Contains(normalizedQuery, StringComparison.Ordinal);
    }
}
