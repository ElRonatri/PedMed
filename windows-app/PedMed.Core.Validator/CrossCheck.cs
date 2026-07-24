// Comparación cruzada manual contra la app web (ver /tmp/js-cases.txt generado
// con doseCalculator.js) para confirmar que el port a C# produce exactamente
// los mismos resultados. No forma parte del build normal: se invoca solo con
// el argumento "crosscheck".

using PedMed.Core.Data;
using PedMed.Core.Services;
using System.Globalization;

static class CrossCheck
{
    public static void Run()
    {
        (string id, double w, double? a)[] cases =
        {
            ("paracetamol", 15, 24),
            ("ibuprofeno", 15, 4),
            ("azitromicina", 12, 60),
            ("rocuronio", 25, null),
            ("loratadina", 35, 60),
            ("rupatadina", 20, 30),
            ("epinefrina-infusion", 18, 24),
            ("ketorolaco", 20, 96),
        };

        foreach (var (id, w, a) in cases)
        {
            var med = MedicationsData.Medications.First(m => m.Id == id);
            var dose = DoseCalculator.Compute(med, w, a);
            var safety = DoseCalculator.GetAgeSafety(med, a);
            Console.WriteLine(
                $"{id} w={w} a={(a?.ToString(CultureInfo.InvariantCulture) ?? "null")} " +
                $"kind={dose.Kind} singleMin={Fmt(dose.SingleMin)} singleMax={Fmt(dose.SingleMax)} " +
                $"dayOne={Fmt(dose.DayOne)} maintenance={Fmt(dose.Maintenance)} " +
                $"doseText={dose.DoseText} rateMin={Fmt(dose.RateMin)} rateMax={Fmt(dose.RateMax)} " +
                $"| safety={safety.Level} text={safety.Text}");
        }
    }

    private static string Fmt(double? v) => v is null ? "null" : v.Value.ToString(CultureInfo.InvariantCulture);
}
