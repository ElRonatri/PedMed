using System.Windows;
using PedMed.Windows.ViewModels;

namespace PedMed.Windows;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = new MainViewModel();
    }
}
