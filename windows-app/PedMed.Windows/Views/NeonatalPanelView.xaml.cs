using System.Diagnostics;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;
using PedMed.Windows.ViewModels;

namespace PedMed.Windows.Views;

public partial class NeonatalPanelView : UserControl
{
    public NeonatalPanelView()
    {
        InitializeComponent();
    }

    private void Hyperlink_OnRequestNavigate(object sender, RequestNavigateEventArgs e)
    {
        Process.Start(new ProcessStartInfo(e.Uri.AbsoluteUri) { UseShellExecute = true });
        e.Handled = true;
    }

    private void SuggestionButton_OnClick(object sender, RoutedEventArgs e)
    {
        if (sender is Button { Tag: MedicationCardViewModel card } && DataContext is NeonatalPanelViewModel vm)
        {
            vm.SelectSuggestion(card);
        }
    }

    private void ClearSearchButton_OnClick(object sender, RoutedEventArgs e)
    {
        if (DataContext is NeonatalPanelViewModel vm)
        {
            vm.SearchText = "";
        }
    }
}
