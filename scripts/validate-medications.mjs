import { MEDICATIONS, CATEGORIES } from '../src/data/medications.js'
import { computeDose, getAgeSafety } from '../src/utils/doseCalculator.js'

const TEST_WEIGHTS = [3, 15, 40, 70]
const TEST_AGES = [1, 8, 30, 180]

let failed = false

function fail(message) {
  failed = true
  console.error(`✗ ${message}`)
}

const ids = MEDICATIONS.map((m) => m.id)
const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i)
if (duplicateIds.length > 0) {
  fail(`Duplicate medication IDs: ${[...new Set(duplicateIds)].join(', ')}`)
}

const invalidCategory = MEDICATIONS.filter((m) => !CATEGORIES.includes(m.category))
if (invalidCategory.length > 0) {
  fail(`Medications with a category not in CATEGORIES: ${invalidCategory.map((m) => m.id).join(', ')}`)
}

for (const med of MEDICATIONS) {
  for (const weightKg of TEST_WEIGHTS) {
    for (const ageMonths of TEST_AGES) {
      try {
        const dose = computeDose(med, weightKg, ageMonths)
        getAgeSafety(med, ageMonths)
        if (dose && 'singleMin' in dose && (Number.isNaN(dose.singleMin) || Number.isNaN(dose.singleMax))) {
          fail(`${med.id} produced NaN at weight=${weightKg} age=${ageMonths}`)
        }
      } catch (e) {
        fail(`${med.id} threw at weight=${weightKg} age=${ageMonths}: ${e.message}`)
      }
    }
  }
}

if (failed) {
  console.error(`\nValidation failed for ${MEDICATIONS.length} medications.`)
  process.exit(1)
}

console.log(`✓ ${MEDICATIONS.length} medications across ${CATEGORIES.length} categories validated (unique IDs, valid categories, no calculation errors).`)
