import { useMemo, useState } from 'react'
import PatientForm from './PatientForm'
import MedicationCard from './MedicationCard'
import MedicationSearchBox from './MedicationSearchBox'
import { CATEGORIES } from '../data/medications'
import { filterMedicationsByQuery } from '../utils/searchMedications'

function toAgeMonths(ageValue, ageUnit) {
  const n = parseFloat(ageValue)
  if (Number.isNaN(n) || n < 0) return null
  return ageUnit === 'años' ? n * 12 : n
}

export default function DoseCalculatorPanel({ medications, idPrefix }) {
  const [weight, setWeight] = useState('')
  const [ageValue, setAgeValue] = useState('')
  const [ageUnit, setAgeUnit] = useState('meses')
  const [searchQuery, setSearchQuery] = useState('')

  const weightKg = useMemo(() => {
    const n = parseFloat(weight)
    return Number.isNaN(n) ? null : n
  }, [weight])

  const ageMonths = useMemo(() => toAgeMonths(ageValue, ageUnit), [ageValue, ageUnit])

  const weightIsInvalid = weight !== '' && (weightKg === null || weightKg <= 0 || weightKg > 150)

  const visibleMedications = useMemo(
    () => filterMedicationsByQuery(medications, searchQuery),
    [medications, searchQuery]
  )

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

      <MedicationSearchBox
        idPrefix={idPrefix}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        matches={visibleMedications}
      />

      <main>
        {CATEGORIES.map((category) => {
          const medsInCategory = visibleMedications.filter((m) => m.category === category)
          if (medsInCategory.length === 0) return null
          return (
            <section key={category} className="category-section">
              <h2>{category}</h2>
              <div className="med-grid">
                {medsInCategory.map((med) => (
                  <MedicationCard
                    key={med.id}
                    med={med}
                    idPrefix={idPrefix}
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
