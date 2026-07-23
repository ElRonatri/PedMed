export default function PatientForm({
  idPrefix,
  weight,
  onWeightChange,
  ageValue,
  onAgeValueChange,
  ageUnit,
  onAgeUnitChange,
}) {
  const weightId = `${idPrefix}-weight`
  const ageId = `${idPrefix}-age`

  return (
    <section className="patient-form" aria-label="Datos del paciente">
      <div className="field">
        <label htmlFor={weightId}>Peso del paciente (kg)</label>
        <input
          id={weightId}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          placeholder="Ej. 12.5"
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor={ageId}>Edad (opcional, recomendada)</label>
        <div className="age-input-group">
          <input
            id={ageId}
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            placeholder="Ej. 18"
            value={ageValue}
            onChange={(e) => onAgeValueChange(e.target.value)}
          />
          <select
            aria-label={`Unidad de edad (${idPrefix})`}
            value={ageUnit}
            onChange={(e) => onAgeUnitChange(e.target.value)}
          >
            <option value="meses">meses</option>
            <option value="años">años</option>
          </select>
        </div>
        <p className="field-hint">
          La edad permite validar la seguridad de cada medicamento. Sin edad, deberá verificar
          manualmente las restricciones.
        </p>
      </div>
    </section>
  )
}
