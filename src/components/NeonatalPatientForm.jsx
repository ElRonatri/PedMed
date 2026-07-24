export default function NeonatalPatientForm({
  idPrefix,
  weight,
  onWeightChange,
  gestationalWeeks,
  onGestationalWeeksChange,
  postnatalDays,
  onPostnatalDaysChange,
}) {
  const weightId = `${idPrefix}-weight`
  const gestationalId = `${idPrefix}-gestational-weeks`
  const postnatalId = `${idPrefix}-postnatal-days`

  return (
    <section className="patient-form" aria-label="Datos del neonato">
      <div className="field">
        <label htmlFor={weightId}>Peso actual (kg)</label>
        <input
          id={weightId}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="Ej. 2.8"
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor={gestationalId}>Edad gestacional al nacer (semanas)</label>
        <input
          id={gestationalId}
          type="number"
          inputMode="decimal"
          min="20"
          max="45"
          step="1"
          placeholder="Ej. 32"
          value={gestationalWeeks}
          onChange={(e) => onGestationalWeeksChange(e.target.value)}
        />
        <p className="field-hint">Semanas completadas de gestación al momento del nacimiento.</p>
      </div>

      <div className="field">
        <label htmlFor={postnatalId}>Edad postnatal (días de vida)</label>
        <input
          id={postnatalId}
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          placeholder="Ej. 5"
          value={postnatalDays}
          onChange={(e) => onPostnatalDaysChange(e.target.value)}
        />
        <p className="field-hint">
          Días transcurridos desde el nacimiento. La dosificación neonatal depende de ambas
          edades (gestacional y postnatal) a la vez.
        </p>
      </div>
    </section>
  )
}
