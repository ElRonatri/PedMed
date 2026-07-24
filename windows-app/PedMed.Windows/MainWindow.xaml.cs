using System.Windows;
using PedMed.Windows.Theme;
using PedMed.Windows.ViewModels;

namespace PedMed.Windows;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = new MainViewModel();
    }

    private void ThemeToggleButton_OnClick(object sender, RoutedEventArgs e)
    {
        ThemeService.Toggle();
        ThemeToggleButton.Content = ThemeService.IsDarkMode ? "☀️ Modo claro" : "🌙 Modo oscuro";
    }
}
