using System.Windows;

namespace PedMed.Windows.Theme;

/// <summary>
/// Toggles the app between light and dark theme by swapping the merged
/// ResourceDictionary that defines all themed brushes (see Theme.Light.xaml /
/// Theme.Dark.xaml). Raises <see cref="ThemeChanged"/> so view-models that
/// compute their own colors in code (e.g. the safety badge on each medication
/// card) can refresh to the matching palette.
/// </summary>
public static class ThemeService
{
    public static event Action? ThemeChanged;

    private static bool _isDarkMode;

    public static bool IsDarkMode
    {
        get => _isDarkMode;
        private set
        {
            if (_isDarkMode == value) return;
            _isDarkMode = value;
            ApplyDictionary();
            ThemeChanged?.Invoke();
        }
    }

    public static void Toggle() => IsDarkMode = !IsDarkMode;

    private static void ApplyDictionary()
    {
        var uri = new Uri(
            _isDarkMode ? "Theme/Theme.Dark.xaml" : "Theme/Theme.Light.xaml",
            UriKind.Relative);
        var newDictionary = new ResourceDictionary { Source = uri };

        var dictionaries = Application.Current.Resources.MergedDictionaries;
        var existingThemeDict = dictionaries.FirstOrDefault(
            d => d.Source is not null && d.Source.OriginalString.Contains("Theme/Theme."));

        if (existingThemeDict is not null)
        {
            var index = dictionaries.IndexOf(existingThemeDict);
            dictionaries[index] = newDictionary;
        }
        else
        {
            dictionaries.Insert(0, newDictionary);
        }
    }
}
