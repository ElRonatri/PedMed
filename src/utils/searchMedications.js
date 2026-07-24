// Normaliza texto para comparación de búsqueda: minúsculas y sin tildes, así
// "amoxicilina" encuentra "Amoxicilina/Ácido Clavulánico" sin depender de
// que el usuario escriba los acentos correctamente.
function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Filtra medicamentos cuyo nombre contiene el texto de búsqueda (comparación
// normalizada, sin distinguir mayúsculas/tildes). Con texto vacío devuelve
// la lista completa sin modificar.
export function filterMedicationsByQuery(medications, query) {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return medications
  return medications.filter((med) => normalizeText(med.name).includes(normalizedQuery))
}
