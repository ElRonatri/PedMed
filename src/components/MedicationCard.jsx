import { computeDose, getAgeSafety } from '../utils/doseCalculator'
import SafetyBadge from './SafetyBadge'

export default function MedicationCard({ med, weightKg, ageMonths }) {
  const hasWeight = weightKg !== null && weightKg > 0
  const safety = getAgeSafety(med, ageMonths)
  const dose = hasWeight ? computeDose(med, weightKg) : null

  return (
    <article className={`med-card safety-border-${safety.level}`}>
      <header className="med-card-header">
        <h3>{med.name}</h3>
        <SafetyBadge level={safety.level} />
      </header>

      <p className="med-indication">{med.indication}</p>

      {!hasWeight && (
        <p className="med-placeholder">Ingrese el peso del paciente para calcular la dosis.</p>
      )}

      {hasWeight && dose && dose.kind === 'standard' && (
        <div className="dose-block">
          <div className="dose-row">
            <span className="dose-label">Dosis por administración</span>
            <span className="dose-value">
              {dose.singleMin === dose.singleMax
                ? `${dose.singleMin} mg`
                : `${dose.singleMin} – ${dose.singleMax} mg`}
              {dose.cappedBySingleMax && <em> (tope máximo aplicado)</em>}
            </span>
          </div>
          {med.concentrationMgPerMl && (
            <div className="dose-row">
              <span className="dose-label">Equivalente en suspensión ({med.concentrationLabel})</span>
              <span className="dose-value">
                {dose.volumeMinMl === dose.volumeMaxMl
                  ? `${dose.volumeMinMl} mL`
                  : `${dose.volumeMinMl} – ${dose.volumeMaxMl} mL`}
              </span>
            </div>
          )}
          <div className="dose-row">
            <span className="dose-label">Frecuencia</span>
            <span className="dose-value">{med.frequencyText}</span>
          </div>
          <div className="dose-row">
            <span className="dose-label">Dosis máxima diaria</span>
            <span className="dose-value">
              {dose.dailyMax} mg/día
              {dose.cappedByDailyMax && <em> (tope máximo aplicado)</em>}
            </span>
          </div>
        </div>
      )}

      {hasWeight && dose && dose.kind === 'azithromycin' && (
        <div className="dose-block">
          <div className="dose-row">
            <span className="dose-label">Día 1 (dosis de carga)</span>
            <span className="dose-value">
              {dose.dayOne} mg
              {med.concentrationMgPerMl && ` (${dose.volumeDayOneMl} mL)`}
              {dose.cappedDayOne && <em> (tope máximo aplicado)</em>}
            </span>
          </div>
          <div className="dose-row">
            <span className="dose-label">Días 2–5 (mantenimiento)</span>
            <span className="dose-value">
              {dose.maintenance} mg
              {med.concentrationMgPerMl && ` (${dose.volumeMaintenanceMl} mL)`}
              {dose.cappedMaintenance && <em> (tope máximo aplicado)</em>}
            </span>
          </div>
          <div className="dose-row">
            <span className="dose-label">Frecuencia</span>
            <span className="dose-value">{med.frequencyText}</span>
          </div>
        </div>
      )}

      <p className={`age-note age-note-${safety.level}`}>{safety.text}</p>
      <p className="general-warning">{med.generalWarning}</p>

      {med.source && (
        <p className="med-source">
          Fuente:{' '}
          <a href={med.source.url} target="_blank" rel="noopener noreferrer">
            {med.source.label}
          </a>
        </p>
      )}
    </article>
  )
}
