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

      <div className="disclaimer disclaimer-hospital" role="alert">
        <strong>Contenido de anestesiología/cuidados críticos:</strong> además de los medicamentos
        ambulatorios habituales, esta app incluye fármacos de uso <strong>exclusivamente
        hospitalario</strong> (anestesia, sedación, relajantes musculares, vasopresores,
        antiarrítmicos y reanimación), marcados con una cinta morada, y opioides/sedantes
        controlados, marcados con una cinta naranja. Esos medicamentos requieren vía IV/IM/IO,
        monitorización continua, capacidad de soporte de vía aérea y personal entrenado; no están
        pensados para administración en el hogar ni sin supervisión médica directa.
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
          Dosis basadas en el{' '}
          <a href="https://www.aeped.es/comites/cm/pediamecum" target="_blank" rel="noopener noreferrer">
            Pediamécum de la Asociación Española de Pediatría (AEP)
          </a>
          . Los valores pueden variar según protocolo institucional, indicación específica y
          presentación comercial disponible.
        </p>
      </footer>
    </div>
  )
}
