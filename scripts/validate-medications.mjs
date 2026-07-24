import { MEDICATIONS, CATEGORIES } from '../src/data/medications.js'
import { computeDose, getAgeSafety } from '../src/utils/doseCalculator.js'

const TEST_WEIGHTS = [3, 15, 40, 70]
const TEST_AGES = [1, 8, 30, 180]
const TEST_NEONATAL_WEIGHTS = [0.6, 1.2, 1.8, 2.5, 3.5]
const TEST_GESTATIONAL_WEEKS = [24, 28, 31, 34, 36, 38, 42, 46]
const TEST_POSTNATAL_DAYS = [0, 3, 7, 10, 14, 21, 28, 35, 60]

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
  if (med.venue === 'neonatal') {
    for (const weightKg of TEST_NEONATAL_WEIGHTS) {
      for (const gestationalWeeks of TEST_GESTATIONAL_WEEKS) {
        for (const postnatalDays of TEST_POSTNATAL_DAYS) {
          try {
            const dose = computeDose(med, weightKg, null, gestationalWeeks, postnatalDays)
            if (
              dose &&
              (dose.doseMin !== undefined || dose.doseMax !== undefined) &&
              (Number.isNaN(dose.doseMin) || Number.isNaN(dose.doseMax))
            ) {
              fail(
                `${med.id} produced NaN at weight=${weightKg} gestationalWeeks=${gestationalWeeks} postnatalDays=${postnatalDays}`
              )
            }
          } catch (e) {
            fail(
              `${med.id} threw at weight=${weightKg} gestationalWeeks=${gestationalWeeks} postnatalDays=${postnatalDays}: ${e.message}`
            )
          }
        }
      }
    }
    // Also verify the "missing input" branches don't throw.
    try {
      computeDose(med, null, null, null, null)
      computeDose(med, 2.5, null, null, null)
      computeDose(med, null, null,30, 5)
    } catch (e) {
      fail(`${med.id} threw with missing neonatal inputs: ${e.message}`)
    }
    continue
  }

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
