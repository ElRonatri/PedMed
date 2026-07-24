import { computeDose, getAgeSafety } from '../utils/doseCalculator'
import SafetyBadge from './SafetyBadge'

const NO_WEIGHT_NEEDED_TYPES = ['ageTier', 'fixed', 'neonatalTier', 'neonatalWeightTier']

const RIBBON_TEXT = {
  hospital: 'Solo uso hospitalario — requiere vía IV/IM/IO, monitorización continua y personal capacitado',
  controlled: 'Medicamento controlado — requiere prescripción y supervisión médica estricta; riesgo de dependencia/depresión respiratoria',
}

export default function MedicationCard({ med, weightKg, ageMonths, gestationalWeeks, postnatalDays, idPrefix }) {
  const hasWeight = weightKg !== null && weightKg > 0
  const safety = getAgeSafety(med, ageMonths)
  const dose =
    hasWeight || NO_WEIGHT_NEEDED_TYPES.includes(med.doseType)
      ? computeDose(med, weightKg, ageMonths, gestationalWeeks, postnatalDays)
      : null
  const ribbonText = RIBBON_TEXT[med.setting]

  return (
    <article id={idPrefix ? `${idPrefix}-med-${med.id}` : undefined} className={`med-card safety-border-${safety.level}`}>
      {ribbonText && <div className={`setting-ribbon setting-ribbon-${med.setting}`}>{ribbonText}</div>}

      <header className="med-card-header">
        <h3>{med.name}</h3>
        <SafetyBadge level={safety.level} />
      </header>

      <p className="med-indication">{med.indication}</p>

      {!NO_WEIGHT_NEEDED_TYPES.includes(med.doseType) && !hasWeight && (
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

      {hasWeight && dose && dose.kind === 'weightDose' && (
        <div className="dose-block">
          <div className="dose-row">
            <span className="dose-label">Dosis por administración</span>
            <span className="dose-value">
              {dose.singleMin === dose.singleMax
                ? `${dose.singleMin} ${dose.unit}`
                : `${dose.singleMin} – ${dose.singleMax} ${dose.unit}`}
              {dose.cappedBySingleMax && <em> (tope máximo aplicado)</em>}
            </span>
          </div>
          <div className="dose-row">
            <span className="dose-label">Vía / Frecuencia</span>
            <span className="dose-value">{med.frequencyText}</span>
          </div>
          {dose.dailyMax !== null && (
            <div className="dose-row">
              <span className="dose-label">Dosis máxima diaria</span>
              <span className="dose-value">
                {dose.dailyMax} {dose.unit}/día
                {dose.cappedByDailyMax && <em> (tope máximo aplicado)</em>}
              </span>
            </div>
          )}
        </div>
      )}

      {hasWeight && dose && dose.kind === 'infusion' && (
        <div className="dose-block">
          <div className="dose-row">
            <span className="dose-label">Tasa para este paciente</span>
            <span className="dose-value">
              {dose.rateMin === dose.rateMax
                ? `${dose.rateMin} ${dose.unit}/${dose.timeUnit}`
                : `${dose.rateMin} – ${dose.rateMax} ${dose.unit}/${dose.timeUnit}`}
              {dose.cappedByMaxRate && <em> (tope máximo aplicado)</em>}
            </span>
          </div>
          <div className="dose-row">
            <span className="dose-label">Vía / Preparación</span>
            <span className="dose-value">{med.frequencyText}</span>
          </div>
          <p className="med-placeholder">
            No se calcula mL/h: depende de la concentración de preparación de la infusión según
            protocolo institucional.
          </p>
        </div>
      )}

      {dose && dose.kind === 'ageTier' && (
        <div className="dose-block">
          {dose.needsAge ? (
            <p className="med-placeholder">Ingrese la edad del paciente para ver la dosis correspondiente.</p>
          ) : (
            <div className="dose-row">
              <span className="dose-label">Dosis según edad</span>
              <span className="dose-value">{dose.doseText}</span>
            </div>
          )}
        </div>
      )}

      {hasWeight && dose && dose.kind === 'weightTier' && (
        <div className="dose-block">
          <div className="dose-row">
            <span className="dose-label">Dosis según peso</span>
            <span className="dose-value">{dose.doseText}</span>
          </div>
        </div>
      )}

      {dose && dose.kind === 'fixed' && (
        <div className="dose-block">
          <div className="dose-row">
            <span className="dose-label">Dosis</span>
            <span className="dose-value">{dose.doseText}</span>
          </div>
        </div>
      )}

      {dose && dose.kind === 'neonatalTier' && (
        <div className="dose-block">
          {dose.needsInput ? (
            <p className="med-placeholder">
              Ingrese la edad gestacional y la edad postnatal para ver la dosis correspondiente.
            </p>
          ) : (
            <>
              <div className="dose-row">
                <span className="dose-label">Frecuencia según tramo</span>
                <span className="dose-value">{dose.frequencyText}</span>
              </div>
              {dose.needsWeight ? (
                <p className="med-placeholder">
                  Ingrese el peso actual para calcular la dosis en {dose.unit}.
                </p>
              ) : (
                <div className="dose-row">
                  <span className="dose-label">Dosis por administración</span>
                  <span className="dose-value">
                    {dose.doseMin === dose.doseMax
                      ? `${dose.doseMin} ${dose.unit}`
                      : `${dose.doseMin} – ${dose.doseMax} ${dose.unit}`}
                    {dose.capped && <em> (tope máximo aplicado)</em>}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {dose && dose.kind === 'neonatalWeightTier' && (
        <div className="dose-block">
          {dose.needsInput ? (
            <p className="med-placeholder">
              Ingrese el peso actual y la edad postnatal para ver la dosis correspondiente.
            </p>
          ) : (
            <>
              <div className="dose-row">
                <span className="dose-label">Frecuencia según tramo</span>
                <span className="dose-value">{dose.frequencyText}</span>
              </div>
              <div className="dose-row">
                <span className="dose-label">Dosis por administración</span>
                <span className="dose-value">
                  {dose.doseMin === dose.doseMax
                    ? `${dose.doseMin} ${dose.unit}`
                    : `${dose.doseMin} – ${dose.doseMax} ${dose.unit}`}
                  {dose.capped && <em> (tope máximo aplicado)</em>}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <p className={`age-note age-note-${safety.level}`}>{safety.text}</p>
      <p className="general-warning">{med.generalWarning}</p>

      {med.source && (
        <p className="med-source">
          {(Array.isArray(med.source) ? med.source : [med.source]).length > 1 ? 'Fuentes: ' : 'Fuente: '}
          {(Array.isArray(med.source) ? med.source : [med.source]).map((src, i, arr) => (
            <span key={src.url || src.label}>
              {src.url ? (
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  {src.label}
                </a>
              ) : (
                src.label
              )}
              {i < arr.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </p>
      )}
    </article>
  )
}
