using System.Diagnostics;
using System.Windows.Controls;
using System.Windows.Navigation;

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
}
