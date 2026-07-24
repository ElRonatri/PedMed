import { useMemo, useState } from 'react'
import NeonatalPatientForm from './NeonatalPatientForm'
import MedicationCard from './MedicationCard'
import MedicationSearchBox from './MedicationSearchBox'
import { CATEGORIES } from '../data/medications'
import { filterMedicationsByQuery } from '../utils/searchMedications'

// Días promedio por mes, usados solo para derivar una edad en meses a partir
// de la edad postnatal (días) y así reutilizar getAgeSafety/ageFlags, que
// están definidos en meses en el resto de la app.
const DAYS_PER_MONTH = 30.44

export default function NeonatalCalculatorPanel({ medications, idPrefix }) {
  const [weight, setWeight] = useState('')
  const [gestationalWeeksInput, setGestationalWeeksInput] = useState('')
  const [postnatalDaysInput, setPostnatalDaysInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const weightKg = useMemo(() => {
    const n = parseFloat(weight)
    return Number.isNaN(n) ? null : n
  }, [weight])

  const gestationalWeeks = useMemo(() => {
    const n = parseFloat(gestationalWeeksInput)
    return Number.isNaN(n) ? null : n
  }, [gestationalWeeksInput])

  const postnatalDays = useMemo(() => {
    const n = parseFloat(postnatalDaysInput)
    return Number.isNaN(n) ? null : n
  }, [postnatalDaysInput])

  const ageMonths = useMemo(
    () => (postnatalDays !== null ? postnatalDays / DAYS_PER_MONTH : null),
    [postnatalDays]
  )

  const weightIsInvalid = weight !== '' && (weightKg === null || weightKg <= 0 || weightKg > 8)
  const gestationalIsInvalid =
    gestationalWeeksInput !== '' &&
    (gestationalWeeks === null || gestationalWeeks < 20 || gestationalWeeks > 45)
  const postnatalIsInvalid =
    postnatalDaysInput !== '' && (postnatalDays === null || postnatalDays < 0)

  const visibleMedications = useMemo(
    () => filterMedicationsByQuery(medications, searchQuery),
    [medications, searchQuery]
  )

  return (
    <div>
      <NeonatalPatientForm
        idPrefix={idPrefix}
        weight={weight}
        onWeightChange={setWeight}
        gestationalWeeks={gestationalWeeksInput}
        onGestationalWeeksChange={setGestationalWeeksInput}
        postnatalDays={postnatalDaysInput}
        onPostnatalDaysChange={setPostnatalDaysInput}
      />

      {weightIsInvalid && (
        <p className="form-error">Ingrese un peso válido en kilogramos (mayor que 0 y hasta 8).</p>
      )}
      {gestationalIsInvalid && (
        <p className="form-error">Ingrese una edad gestacional válida en semanas (entre 20 y 45).</p>
      )}
      {postnatalIsInvalid && (
        <p className="form-error">Ingrese una edad postnatal válida en días (0 o mayor).</p>
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
                    gestationalWeeks={!gestationalIsInvalid ? gestationalWeeks : null}
                    postnatalDays={!postnatalIsInvalid ? postnatalDays : null}
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
