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

// Selecciona la dosis mg/kg (u otra unidad) y la frecuencia según el tramo de
// edad gestacional al nacer (semanas) y edad postnatal (días) del neonato —
// ambas dimensiones a la vez, ya que la dosificación neonatal depende de las
// dos. Se prueban los tramos en el orden declarado y se usa el primero cuyo
// límite superior de AMBAS dimensiones sea mayor que los valores del
// paciente (mismo criterio "primer match" que ageTier/weightTier, pero en 2D).
function computeNeonatalTierDose(med, weightKg, gestationalWeeks, postnatalDays) {
  if (
    gestationalWeeks === null ||
    gestationalWeeks === undefined ||
    Number.isNaN(gestationalWeeks) ||
    postnatalDays === null ||
    postnatalDays === undefined ||
    Number.isNaN(postnatalDays)
  ) {
    return { kind: 'neonatalTier', needsInput: true }
  }

  const tiers = med.neonatalTiers
  const tier =
    tiers.find((t) => gestationalWeeks < t.maxGestationalWeeks && postnatalDays < t.maxPostnatalDays) ||
    tiers[tiers.length - 1]

  const hasWeight = typeof weightKg === 'number' && weightKg > 0
  const rawMin = hasWeight ? weightKg * tier.perKgMin : null
  const rawMax = hasWeight ? weightKg * tier.perKgMax : null
  const doseMin = rawMin !== null && tier.maxSingle ? Math.min(rawMin, tier.maxSingle) : rawMin
  const doseMax = rawMax !== null && tier.maxSingle ? Math.min(rawMax, tier.maxSingle) : rawMax
  const capped = Boolean(hasWeight && tier.maxSingle && rawMax > tier.maxSingle)

  return {
    kind: 'neonatalTier',
    needsInput: false,
    needsWeight: !hasWeight,
    doseMin: doseMin !== null ? round(doseMin, 2) : null,
    doseMax: doseMax !== null ? round(doseMax, 2) : null,
    unit: med.unit,
    frequencyText: tier.frequencyText,
    capped,
  }
}

// Igual que computeNeonatalTierDose, pero para fármacos cuya tabla original
// tiera por PESO ACTUAL (no edad gestacional) + edad postnatal — se usa el
// mismo peso ya ingresado para el cálculo de la dosis y para elegir el tramo.
function computeNeonatalWeightTierDose(med, weightKg, postnatalDays) {
  const hasWeight = typeof weightKg === 'number' && weightKg > 0
  if (!hasWeight || postnatalDays === null || postnatalDays === undefined || Number.isNaN(postnatalDays)) {
    return { kind: 'neonatalWeightTier', needsInput: true, needsWeight: !hasWeight }
  }

  const tiers = med.neonatalWeightTiers
  const tier =
    tiers.find((t) => weightKg < t.maxWeightKg && postnatalDays < t.maxPostnatalDays) ||
    tiers[tiers.length - 1]

  const rawMin = weightKg * tier.perKgMin
  const rawMax = weightKg * tier.perKgMax
  const doseMin = tier.maxSingle ? Math.min(rawMin, tier.maxSingle) : rawMin
  const doseMax = tier.maxSingle ? Math.min(rawMax, tier.maxSingle) : rawMax
  const capped = Boolean(tier.maxSingle && rawMax > tier.maxSingle)

  return {
    kind: 'neonatalWeightTier',
    needsInput: false,
    needsWeight: false,
    doseMin: round(doseMin, 2),
    doseMax: round(doseMax, 2),
    unit: med.unit,
    frequencyText: tier.frequencyText,
    capped,
  }
}

export function computeDose(med, weightKg, ageMonths, gestationalWeeks, postnatalDays) {
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
  if (med.doseType === 'neonatalTier') {
    return computeNeonatalTierDose(med, weightKg, gestationalWeeks, postnatalDays)
  }
  if (med.doseType === 'neonatalWeightTier') {
    return computeNeonatalWeightTierDose(med, weightKg, postnatalDays)
  }
  return computeStandardDose(med, weightKg)
}
