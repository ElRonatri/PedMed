import { useMemo, useState } from 'react'
import PatientForm from './components/PatientForm'
import MedicationCard from './components/MedicationCard'
import { CATEGORIES, MEDICATIONS } from './data/medications'

function toAgeMonths(ageValue, ageUnit) {
  const n = parseFloat(ageValue)
  if (Number.isNaN(n) || n < 0) return null
  return ageUnit === 'años' ? n * 12 : n
}

export default function App() {
  const [weight, setWeight] = useState('')
  const [ageValue, setAgeValue] = useState('')
  const [ageUnit, setAgeUnit] = useState('meses')

  const weightKg = useMemo(() => {
    const n = parseFloat(weight)
    return Number.isNaN(n) ? null : n
  }, [weight])

  const ageMonths = useMemo(() => toAgeMonths(ageValue, ageUnit), [ageValue, ageUnit])

  const weightIsInvalid = weight !== '' && (weightKg === null || weightKg <= 0 || weightKg > 150)

  return (
    <div className="app">
      <header className="app-header">
        <h1>PedMed</h1>
        <p className="subtitle">Calculadora de dosis pediátrica por peso</p>
      </header>

      <div className="disclaimer" role="alert">
        <strong>Aviso importante:</strong> esta herramienta es solo con fines educativos y de
        apoyo. No sustituye el criterio clínico, la ficha técnica del medicamento ni la
        evaluación de un médico o farmacéutico. Verifique siempre las dosis antes de administrar
        cualquier medicamento a un paciente pediátrico.
      </div>

      <PatientForm
        weight={weight}
        onWeightChange={setWeight}
        ageValue={ageValue}
        onAgeValueChange={setAgeValue}
        ageUnit={ageUnit}
        onAgeUnitChange={setAgeUnit}
      />

      {weightIsInvalid && (
        <p className="form-error">Ingrese un peso válido en kilogramos (mayor que 0 y hasta 150).</p>
      )}

      <main>
        {CATEGORIES.map((category) => {
          const medsInCategory = MEDICATIONS.filter((m) => m.category === category)
          if (medsInCategory.length === 0) return null
          return (
            <section key={category} className="category-section">
              <h2>{category}</h2>
              <div className="med-grid">
                {medsInCategory.map((med) => (
                  <MedicationCard
                    key={med.id}
                    med={med}
                    weightKg={!weightIsInvalid ? weightKg : null}
                    ageMonths={ageMonths}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </main>

      <footer className="app-footer">
        <p>
          Referencias generales de formularios pediátricos. Los valores pueden variar según
          protocolo institucional, indicación específica y presentación comercial disponible.
        </p>
      </footer>
    </div>
  )
}
