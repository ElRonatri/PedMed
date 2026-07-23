// Utilidades de cálculo de dosis y de seguridad por edad.
// Uso educativo: todo resultado debe ser verificado por personal médico
// antes de administrar cualquier medicamento a un paciente pediátrico.

export function round(value, decimals = 1) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

// Determina el estado de seguridad por edad para un medicamento dado.
// Devuelve { level: 'unknown' | 'ok' | 'caution' | 'contraindicated', text }
export function getAgeSafety(med, ageMonths) {
  if (ageMonths === null || ageMonths === undefined || Number.isNaN(ageMonths)) {
    return {
      level: 'unknown',
      text: 'Edad no ingresada: verifique manualmente las restricciones por edad antes de usar este medicamento.',
    }
  }

  const flags = med.ageFlags || []
  // Se prioriza la restricción más severa que aplique a la edad indicada.
  const contraindicated = flags.find(
    (f) => f.level === 'contraindicated' && ageMonths < f.maxMonths
  )
  if (contraindicated) {
    return { level: 'contraindicated', text: contraindicated.text }
  }

  const caution = flags.find((f) => f.level === 'caution' && ageMonths < f.maxMonths)
  if (caution) {
    return { level: 'caution', text: caution.text }
  }

  return { level: 'ok', text: 'Sin restricción específica de edad para el rango indicado.' }
}

// Calcula la dosis para medicamentos de tipo "standard" (mg/kg con topes).
function computeStandardDose(med, weightKg) {
  const rawMin = weightKg * med.mgPerKgMin
  const rawMax = weightKg * med.mgPerKgMax

  const singleMin = med.maxSingleDoseMg ? Math.min(rawMin, med.maxSingleDoseMg) : rawMin
  const singleMax = med.maxSingleDoseMg ? Math.min(rawMax, med.maxSingleDoseMg) : rawMax

  const rawDaily = weightKg * med.maxDailyMgPerKg
  const dailyMax = med.maxDailyMg ? Math.min(rawDaily, med.maxDailyMg) : rawDaily

  const cappedBySingleMax = med.maxSingleDoseMg && rawMax > med.maxSingleDoseMg
  const cappedByDailyMax = med.maxDailyMg && rawDaily > med.maxDailyMg

  return {
    kind: 'standard',
    singleMin: round(singleMin),
    singleMax: round(singleMax),
    dailyMax: round(dailyMax),
    cappedBySingleMax,
    cappedByDailyMax,
    volumeMinMl: med.concentrationMgPerMl ? round(singleMin / med.concentrationMgPerMl) : null,
    volumeMaxMl: med.concentrationMgPerMl ? round(singleMax / med.concentrationMgPerMl) : null,
  }
}

// Calcula la dosis para el esquema especial de azitromicina (carga + mantenimiento).
function computeAzithromycinDose(med, weightKg) {
  const rawDayOne = weightKg * med.dayOneMgPerKg
  const rawMaintenance = weightKg * med.maintenanceMgPerKg

  const dayOne = Math.min(rawDayOne, med.dayOneMaxMg)
  const maintenance = Math.min(rawMaintenance, med.maintenanceMaxMg)

  return {
    kind: 'azithromycin',
    dayOne: round(dayOne),
    maintenance: round(maintenance),
    cappedDayOne: rawDayOne > med.dayOneMaxMg,
    cappedMaintenance: rawMaintenance > med.maintenanceMaxMg,
    volumeDayOneMl: med.concentrationMgPerMl ? round(dayOne / med.concentrationMgPerMl) : null,
    volumeMaintenanceMl: med.concentrationMgPerMl
      ? round(maintenance / med.concentrationMgPerMl)
      : null,
  }
}

export function computeDose(med, weightKg) {
  if (med.doseType === 'azithromycin') {
    return computeAzithromycinDose(med, weightKg)
  }
  return computeStandardDose(med, weightKg)
}
