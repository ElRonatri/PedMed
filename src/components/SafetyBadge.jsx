const LABELS = {
  unknown: 'Edad no especificada',
  ok: 'Sin restricción por edad',
  caution: 'Precaución',
  contraindicated: 'Contraindicado',
}

export default function SafetyBadge({ level }) {
  return <span className={`safety-badge safety-${level}`}>{LABELS[level] || 'Desconocido'}</span>
}
