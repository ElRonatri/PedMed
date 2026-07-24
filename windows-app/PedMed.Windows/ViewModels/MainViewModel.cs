using PedMed.Core.Data;

namespace PedMed.Windows.ViewModels;

public sealed class MainViewModel
{
    public PatientPanelViewModel PrincipalPanel { get; }
    public PatientPanelViewModel HospitalPanel { get; }
    public NeonatalPanelViewModel NeonatalPanel { get; }

    public MainViewModel()
    {
        var all = MedicationsData.Medications;
        var categories = MedicationsData.Categories;

        PrincipalPanel = new PatientPanelViewModel(all.Where(m => !m.IsHospitalVenue && !m.IsNeonatalVenue), categories);
        HospitalPanel = new PatientPanelViewModel(all.Where(m => m.IsHospitalVenue), categories);
        NeonatalPanel = new NeonatalPanelViewModel(all.Where(m => m.IsNeonatalVenue), categories);
    }
}
