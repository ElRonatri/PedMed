import { useMemo, useState } from 'react'
import PatientForm from './PatientForm'
import MedicationCard from './MedicationCard'
import { CATEGORIES } from '../data/medications'

function toAgeMonths(ageValue, ageUnit) {
  const n = parseFloat(ageValue)
  if (Number.isNaN(n) || n < 0) return null
  return ageUnit === 'años' ? n * 12 : n
}

export default function DoseCalculatorPanel({ medications, idPrefix }) {
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
    <div>
      <PatientForm
        idPrefix={idPrefix}
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
          const medsInCategory = medications.filter((m) => m.category === category)
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
    </div>
  )
}
