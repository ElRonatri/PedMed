// Valida los datos y el motor de cálculo de PedMed.Core: IDs únicos,
// categorías válidas, y ausencia de errores/NaN para una malla de
// peso/edad — un port del script scripts/validate-medications.mjs de la
// app web, para verificar el port a C# antes de compilar la UI de WPF.

using PedMed.Core.Data;
using PedMed.Core.Services;

if (args.Contains("crosscheck"))
{
    CrossCheck.Run();
    return;
}

var failed = false;

void Fail(string message)
{
    failed = true;
    Console.Error.WriteLine($"✗ {message}");
}

var meds = MedicationsData.Medications;
var categories = MedicationsData.Categories;

var ids = meds.Select(m => m.Id).ToList();
var duplicateIds = ids.GroupBy(id => id).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
if (duplicateIds.Count > 0)
{
    Fail($"Duplicate medication IDs: {string.Join(", ", duplicateIds)}");
}

var invalidCategory = meds.Where(m => !categories.Contains(m.Category)).ToList();
if (invalidCategory.Count > 0)
{
    Fail($"Medications with a category not in Categories: {string.Join(", ", invalidCategory.Select(m => m.Id))}");
}

double[] testWeights = { 3, 15, 40, 70 };
double[] testAges = { 1, 8, 30, 180 };

foreach (var med in meds)
{
    foreach (var weightKg in testWeights)
    {
        foreach (var ageMonths in testAges)
        {
            try
            {
                var dose = DoseCalculator.Compute(med, weightKg, ageMonths);
                DoseCalculator.GetAgeSafety(med, ageMonths);
                if (dose.SingleMin is { } sMin && double.IsNaN(sMin))
                {
                    Fail($"{med.Id} produced NaN SingleMin at weight={weightKg} age={ageMonths}");
                }
                if (dose.SingleMax is { } sMax && double.IsNaN(sMax))
                {
                    Fail($"{med.Id} produced NaN SingleMax at weight={weightKg} age={ageMonths}");
                }
            }
            catch (Exception e)
            {
                Fail($"{med.Id} threw at weight={weightKg} age={ageMonths}: {e.Message}");
            }
        }
    }
}

if (failed)
{
    Console.Error.WriteLine($"\nValidation failed for {meds.Count} medications.");
    Environment.Exit(1);
}

Console.WriteLine(
    $"✓ {meds.Count} medications across {categories.Count} categories validated (unique IDs, valid categories, no calculation errors).");
