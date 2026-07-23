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

// Calcula dosis por kg en unidades arbitrarias (mg, mcg, mL, mEq, U), sin
// conversión a mL de suspensión (no aplica a fármacos IV/IM/parenterales).
function computeWeightDose(med, weightKg) {
  const rawMin = weightKg * med.perKgMin
  const rawMax = weightKg * med.perKgMax

  const singleMin = med.maxSingle ? Math.min(rawMin, med.maxSingle) : rawMin
  const singleMax = med.maxSingle ? Math.min(rawMax, med.maxSingle) : rawMax
  const cappedBySingleMax = med.maxSingle && rawMax > med.maxSingle

  let dailyMax = null
  let cappedByDailyMax = false
  if (med.maxDailyPerKg) {
    const rawDaily = weightKg * med.maxDailyPerKg
    dailyMax = med.maxDailyMax ? Math.min(rawDaily, med.maxDailyMax) : rawDaily
    cappedByDailyMax = Boolean(med.maxDailyMax && rawDaily > med.maxDailyMax)
    dailyMax = round(dailyMax, 2)
  }

  return {
    kind: 'weightDose',
    unit: med.unit,
    singleMin: round(singleMin, 2),
    singleMax: round(singleMax, 2),
    cappedBySingleMax,
    dailyMax,
    cappedByDailyMax,
  }
}

// Calcula una tasa de infusión (por kg/min o kg/h) para el peso del paciente.
// No se calcula mL/h: depende de la concentración de preparación de cada
// institución, y asumir una lo convertiría en un cálculo no verificable.
function computeInfusionDose(med, weightKg) {
  const rawMin = weightKg * med.perKgMin
  const rawMax = weightKg * med.perKgMax
  const cappedByMaxRate = med.maxRate && rawMax > med.maxRate
  const rateMin = med.maxRate ? Math.min(rawMin, med.maxRate) : rawMin
  const rateMax = med.maxRate ? Math.min(rawMax, med.maxRate) : rawMax

  return {
    kind: 'infusion',
    unit: med.unit,
    timeUnit: med.timeUnit,
    rateMin: round(rateMin, 2),
    rateMax: round(rateMax, 2),
    cappedByMaxRate,
  }
}

// Selecciona el texto de dosis fija correspondiente al tramo de edad del
// paciente (en meses). No implica multiplicación por peso ni edad.
function computeAgeTierDose(med, ageMonths) {
  if (ageMonths === null || ageMonths === undefined || Number.isNaN(ageMonths)) {
    return { kind: 'ageTier', doseText: null, needsAge: true }
  }
  const tier = med.tiers.find((t) => ageMonths < t.maxMonths) || med.tiers[med.tiers.length - 1]
  return { kind: 'ageTier', doseText: tier.doseText, needsAge: false }
}

// Selecciona el texto de dosis fija correspondiente al tramo de peso del
// paciente (en kg).
function computeWeightTierDose(med, weightKg) {
  const tier = med.tiers.find((t) => weightKg < t.maxKg) || med.tiers[med.tiers.length - 1]
  return { kind: 'weightTier', doseText: tier.doseText }
}

// Dosis plana, sin cálculo por peso ni edad (la fuente no la expresa por kg).
function computeFixedDose(med) {
  return { kind: 'fixed', doseText: med.doseText }
}

export function computeDose(med, weightKg, ageMonths) {
  if (med.doseType === 'azithromycin') {
    return computeAzithromycinDose(med, weightKg)
  }
  if (med.doseType === 'weightDose') {
    return computeWeightDose(med, weightKg)
  }
  if (med.doseType === 'infusion') {
    return computeInfusionDose(med, weightKg)
  }
  if (med.doseType === 'ageTier') {
    return computeAgeTierDose(med, ageMonths)
  }
  if (med.doseType === 'weightTier') {
    return computeWeightTierDose(med, weightKg)
  }
  if (med.doseType === 'fixed') {
    return computeFixedDose(med)
  }
  return computeStandardDose(med, weightKg)
}
