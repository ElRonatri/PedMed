// Genera windows-app/PedMed.Core/Data/MedicationsData.cs a partir de
// src/data/medications.js, para que la app de Windows (C#/WPF) use exactamente
// los mismos datos que la app web, sin transcripción manual propensa a errores.
//
// Uso: node scripts/generate-csharp-medications.mjs

import { MEDICATIONS, CATEGORIES } from '../src/data/medications.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_PATH = path.join(__dirname, '../windows-app/PedMed.Core/Data/MedicationsData.cs')

const DOSE_TYPE_MAP = {
  standard: 'Standard',
  weightDose: 'WeightDose',
  azithromycin: 'Azithromycin',
  infusion: 'Infusion',
  ageTier: 'AgeTier',
  weightTier: 'WeightTier',
  fixed: 'Fixed',
}

const LEVEL_MAP = {
  contraindicated: 'SafetyLevel.Contraindicated',
  caution: 'SafetyLevel.Caution',
  ok: 'SafetyLevel.Ok',
  unknown: 'SafetyLevel.Unknown',
}

function csString(s) {
  if (s === null || s === undefined) return 'null'
  const escaped = String(s)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
  return `"${escaped}"`
}

function csDouble(n) {
  if (n === null || n === undefined) return 'null'
  if (n === Infinity) return 'double.PositiveInfinity'
  if (n === -Infinity) return 'double.NegativeInfinity'
  return `${n}d`
}

function indent(level) {
  return '    '.repeat(level)
}

function generateSources(med) {
  const sources = med.source ? (Array.isArray(med.source) ? med.source : [med.source]) : []
  if (sources.length === 0) return `${indent(3)}Sources = Array.Empty<MedicationSource>(),`
  const items = sources
    .map((s) => `${indent(4)}new MedicationSource(${csString(s.label)}, ${csString(s.url)}),`)
    .join('\n')
  return `${indent(3)}Sources = new List<MedicationSource>\n${indent(3)}{\n${items}\n${indent(3)}},`
}

function generateAgeFlags(med) {
  const flags = med.ageFlags || []
  if (flags.length === 0) return `${indent(3)}AgeFlags = Array.Empty<AgeFlag>(),`
  const items = flags
    .map(
      (f) =>
        `${indent(4)}new AgeFlag(${csDouble(f.maxMonths)}, ${LEVEL_MAP[f.level]}, ${csString(f.text)}),`
    )
    .join('\n')
  return `${indent(3)}AgeFlags = new List<AgeFlag>\n${indent(3)}{\n${items}\n${indent(3)}},`
}

function generateTiers(med) {
  if (med.doseType === 'ageTier') {
    const items = med.tiers
      .map((t) => `${indent(4)}new AgeTierEntry(${csDouble(t.maxMonths)}, ${csString(t.doseText)}),`)
      .join('\n')
    return `${indent(3)}AgeTiers = new List<AgeTierEntry>\n${indent(3)}{\n${items}\n${indent(3)}},`
  }
  if (med.doseType === 'weightTier') {
    const items = med.tiers
      .map((t) => `${indent(4)}new WeightTierEntry(${csDouble(t.maxKg)}, ${csString(t.doseText)}),`)
      .join('\n')
    return `${indent(3)}WeightTiers = new List<WeightTierEntry>\n${indent(3)}{\n${items}\n${indent(3)}},`
  }
  return null
}

function generateMedication(med) {
  const lines = []
  lines.push(`${indent(2)}new Medication`)
  lines.push(`${indent(2)}{`)
  lines.push(`${indent(3)}Id = ${csString(med.id)},`)
  lines.push(`${indent(3)}Name = ${csString(med.name)},`)
  lines.push(`${indent(3)}Category = ${csString(med.category)},`)
  lines.push(`${indent(3)}DoseType = DoseType.${DOSE_TYPE_MAP[med.doseType]},`)
  if (med.venue) lines.push(`${indent(3)}Venue = ${csString(med.venue)},`)
  if (med.setting) lines.push(`${indent(3)}Setting = ${csString(med.setting)},`)

  // Standard
  if (med.mgPerKgMin !== undefined) lines.push(`${indent(3)}MgPerKgMin = ${csDouble(med.mgPerKgMin)},`)
  if (med.mgPerKgMax !== undefined) lines.push(`${indent(3)}MgPerKgMax = ${csDouble(med.mgPerKgMax)},`)
  if (med.maxSingleDoseMg !== undefined) lines.push(`${indent(3)}MaxSingleDoseMg = ${csDouble(med.maxSingleDoseMg)},`)
  if (med.maxDailyMgPerKg !== undefined) lines.push(`${indent(3)}MaxDailyMgPerKg = ${csDouble(med.maxDailyMgPerKg)},`)
  if (med.maxDailyMg !== undefined) lines.push(`${indent(3)}MaxDailyMg = ${csDouble(med.maxDailyMg)},`)
  if (med.concentrationMgPerMl !== undefined) lines.push(`${indent(3)}ConcentrationMgPerMl = ${csDouble(med.concentrationMgPerMl)},`)
  if (med.concentrationLabel !== undefined) lines.push(`${indent(3)}ConcentrationLabel = ${csString(med.concentrationLabel)},`)

  // WeightDose
  if (med.unit !== undefined) lines.push(`${indent(3)}Unit = ${csString(med.unit)},`)
  if (med.perKgMin !== undefined) lines.push(`${indent(3)}PerKgMin = ${csDouble(med.perKgMin)},`)
  if (med.perKgMax !== undefined) lines.push(`${indent(3)}PerKgMax = ${csDouble(med.perKgMax)},`)
  if (med.maxSingle !== undefined) lines.push(`${indent(3)}MaxSingle = ${csDouble(med.maxSingle)},`)
  if (med.maxDailyPerKg !== undefined) lines.push(`${indent(3)}MaxDailyPerKg = ${csDouble(med.maxDailyPerKg)},`)
  if (med.maxDailyMax !== undefined) lines.push(`${indent(3)}MaxDailyMax = ${csDouble(med.maxDailyMax)},`)

  // Azithromycin
  if (med.dayOneMgPerKg !== undefined) lines.push(`${indent(3)}DayOneMgPerKg = ${csDouble(med.dayOneMgPerKg)},`)
  if (med.dayOneMaxMg !== undefined) lines.push(`${indent(3)}DayOneMaxMg = ${csDouble(med.dayOneMaxMg)},`)
  if (med.maintenanceMgPerKg !== undefined) lines.push(`${indent(3)}MaintenanceMgPerKg = ${csDouble(med.maintenanceMgPerKg)},`)
  if (med.maintenanceMaxMg !== undefined) lines.push(`${indent(3)}MaintenanceMaxMg = ${csDouble(med.maintenanceMaxMg)},`)

  // Infusion
  if (med.timeUnit !== undefined) lines.push(`${indent(3)}TimeUnit = ${csString(med.timeUnit)},`)
  if (med.maxRate !== undefined) lines.push(`${indent(3)}MaxRate = ${csDouble(med.maxRate)},`)

  // Tiers
  const tiers = generateTiers(med)
  if (tiers) lines.push(tiers)

  // Fixed
  if (med.doseText !== undefined) lines.push(`${indent(3)}DoseText = ${csString(med.doseText)},`)

  lines.push(`${indent(3)}FrequencyText = ${csString(med.frequencyText)},`)
  lines.push(`${indent(3)}Indication = ${csString(med.indication)},`)
  lines.push(generateAgeFlags(med))
  lines.push(`${indent(3)}GeneralWarning = ${csString(med.generalWarning)},`)
  lines.push(generateSources(med))
  lines.push(`${indent(2)}},`)
  return lines.join('\n')
}

const categoriesBlock = CATEGORIES.map((c) => `${indent(2)}${csString(c)},`).join('\n')
const medicationsBlock = MEDICATIONS.map(generateMedication).join('\n')

const output = `// <auto-generated>
// Generado por scripts/generate-csharp-medications.mjs a partir de
// src/data/medications.js — NO editar a mano. Para actualizar los datos,
// edita medications.js y vuelve a ejecutar el script generador.
// </auto-generated>

using PedMed.Core.Models;

namespace PedMed.Core.Data;

public static class MedicationsData
{
    public static readonly IReadOnlyList<string> Categories = new List<string>
    {
${categoriesBlock}
    };

    public static readonly IReadOnlyList<Medication> Medications = new List<Medication>
    {
${medicationsBlock}
    };
}
`

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
fs.writeFileSync(OUT_PATH, output, 'utf8')
console.log(`Generated ${MEDICATIONS.length} medications across ${CATEGORIES.length} categories -> ${path.relative(process.cwd(), OUT_PATH)}`)
