// Datos de dosificación pediátrica basados en el Pediamécum de la Asociación
// Española de Pediatría (AEP) — https://www.aeped.es/comites/cm/pediamecum
// Uso educativo: todo resultado debe ser verificado por personal médico
// antes de administrar cualquier medicamento a un paciente pediátrico.
// Los valores mg/kg, topes de dosis y umbrales de edad son los recogidos en
// las fichas de Pediamécum para las indicaciones más habituales; pueden
// variar según indicación específica, protocolo institucional y
// presentación comercial disponible en cada país.

export const CATEGORIES = [
  'Antipirético / Analgésico',
  'Antibiótico',
  'Antiemético',
  'Antihistamínico',
  'Corticosteroide',
]

const AEP_BASE = 'https://www.aeped.es/comites/cm/pediamecum/principios-activos'

// level: 'contraindicated' | 'caution'
// maxMonths: el flag aplica si la edad del paciente (en meses) es < maxMonths
function ageFlag(maxMonths, level, text) {
  return { maxMonths, level, text }
}

export const MEDICATIONS = [
  {
    id: 'paracetamol',
    name: 'Paracetamol (Acetaminofén)',
    category: 'Antipirético / Analgésico',
    doseType: 'standard',
    mgPerKgMin: 10,
    mgPerKgMax: 15,
    maxSingleDoseMg: 1000,
    maxDailyMgPerKg: 60,
    maxDailyMg: 4000,
    frequencyText: '10 mg/kg cada 4 horas o 15 mg/kg cada 6 horas (máx. 60 mg/kg/día)',
    concentrationMgPerMl: 32, // suspensión típica 160 mg/5 mL
    concentrationLabel: '160 mg / 5 mL',
    indication:
      'Fiebre y dolor leve a moderado. Antipirético/analgésico de primera línea en pediatría por su amplio margen de seguridad.',
    ageFlags: [
      ageFlag(3, 'caution', 'En menores de 3 meses usar solo bajo supervisión médica estricta, con intervalos más amplios (cada 6–8 h) y control estrecho.'),
    ],
    generalWarning: 'Evitar en insuficiencia hepática grave. Respetar el intervalo mínimo entre dosis para prevenir toxicidad hepática por acumulación.',
    source: { label: 'AEP · Pediamécum — Paracetamol/Acetaminofén', url: `${AEP_BASE}/paracetamol-acetaminofen` },
  },
  {
    id: 'ibuprofeno',
    name: 'Ibuprofeno',
    category: 'Antipirético / Analgésico',
    doseType: 'standard',
    mgPerKgMin: 5,
    mgPerKgMax: 10,
    maxSingleDoseMg: 400,
    maxDailyMgPerKg: 40,
    maxDailyMg: 1600,
    frequencyText: 'Cada 6–8 horas (20–30 mg/kg/día en 3–4 tomas)',
    concentrationMgPerMl: 20, // 100 mg/5 mL
    concentrationLabel: '100 mg / 5 mL',
    indication:
      'Fiebre y dolor moderado-grave con componente inflamatorio. Alternativa al paracetamol cuando no hay contraindicación.',
    ageFlags: [
      ageFlag(3, 'contraindicated', 'No se recomienda su uso en menores de 3 meses.'),
      ageFlag(6, 'caution', 'Entre 3 y 6 meses, otras guías (OMS, BNF Paediatric) recomiendan evitarlo salvo indicación médica expresa.'),
    ],
    generalWarning: 'Máximo 1600 mg/día si el paciente pesa <40 kg (uso analgésico/antipirético habitual); en artritis idiopática juvenil se autorizan dosis mayores (hasta 40–50 mg/kg/día) bajo supervisión especializada desde los 6 meses. Evitar en deshidratación, varicela activa o insuficiencia renal.',
    source: { label: 'AEP · Pediamécum — Ibuprofeno', url: `${AEP_BASE}/ibuprofeno` },
  },
  {
    id: 'amoxicilina',
    name: 'Amoxicilina',
    category: 'Antibiótico',
    doseType: 'standard',
    mgPerKgMin: 40,
    mgPerKgMax: 50,
    maxSingleDoseMg: 1000,
    maxDailyMgPerKg: 90,
    maxDailyMg: 3000,
    frequencyText: 'Cada 8 horas (dividido en 2–3 dosis/día)',
    concentrationMgPerMl: 50, // 250 mg/5 mL
    concentrationLabel: '250 mg / 5 mL',
    indication:
      'Infecciones respiratorias, óticas (otitis media aguda) y urinarias por gérmenes sensibles.',
    ageFlags: [
      ageFlag(1, 'caution', 'En neonatos (<1 mes) ajustar dosis e intervalo según edad gestacional y postnatal; requiere supervisión médica.'),
    ],
    generalWarning: 'En otitis media aguda o sospecha de neumococo resistente se usa dosis alta: 80–90 mg/kg/día en 3 tomas (máx. 3 g/día). Contraindicada en alergia confirmada a penicilinas. En insuficiencia renal grave (ClCr <10 mL/min) reducir a 15 mg/kg/día en dosis única (máx. 500 mg/día si >40 kg).',
    source: { label: 'AEP · Pediamécum — Amoxicilina', url: `${AEP_BASE}/amoxicilina` },
  },
  {
    id: 'azitromicina',
    name: 'Azitromicina',
    category: 'Antibiótico',
    doseType: 'azithromycin',
    dayOneMgPerKg: 10,
    dayOneMaxMg: 500,
    maintenanceMgPerKg: 5,
    maintenanceMaxMg: 250,
    frequencyText: '1 vez al día. Pauta estándar: 10 mg/kg/día x 3 días. Pauta alternativa: 10 mg/kg el día 1, luego 5 mg/kg/día los días 2–5',
    concentrationMgPerMl: 40, // 200 mg/5 mL
    concentrationLabel: '200 mg / 5 mL',
    indication:
      'Alternativa en alergia a penicilinas; neumonía atípica e infecciones de vías respiratorias.',
    ageFlags: [
      ageFlag(1.5, 'caution', 'Precaución en menores de 6 semanas por riesgo descrito de estenosis pilórica hipertrófica.'),
    ],
    generalWarning: 'Para niños <15 kg se dosifica por kg; entre 15–25 kg suele usarse una dosis fija de 200 mg/día. Vigilar intervalo QT en pacientes con cardiopatía o uso concomitante de otros fármacos que lo prolonguen.',
    source: { label: 'AEP · Pediamécum — Azitromicina', url: `${AEP_BASE}/azitromicina` },
  },
  {
    id: 'cefalexina',
    name: 'Cefalexina',
    category: 'Antibiótico',
    doseType: 'standard',
    mgPerKgMin: 25,
    mgPerKgMax: 50,
    maxSingleDoseMg: 500,
    maxDailyMgPerKg: 100,
    maxDailyMg: 4000,
    frequencyText: 'Cada 6–8 horas; cada 12 horas en faringitis estreptocócica; hasta cada 6–12 h con dosis altas en otitis media aguda',
    concentrationMgPerMl: 50, // 250 mg/5 mL
    concentrationLabel: '250 mg / 5 mL',
    indication:
      'Impétigo, celulitis/erisipela, otitis media aguda y faringoamigdalitis estreptocócica (como segunda línea).',
    ageFlags: [
      ageFlag(1, 'caution', 'Uso en menores de 1 mes solo bajo supervisión médica especializada.'),
    ],
    generalWarning: 'La dosis varía según indicación: impétigo 25–50 mg/kg/día (máx. 250 mg/dosis); celulitis/erisipela 25–50 mg/kg/día (máx. 500 mg/6 h); otitis media aguda 75–100 mg/kg/día; faringitis estreptocócica 40 mg/kg/día cada 12 h (máx. 500 mg/12 h) durante 10 días. Ajustar en insuficiencia renal.',
    source: { label: 'AEP · Pediamécum — Cefalexina', url: `${AEP_BASE}/cefalexina` },
  },
  {
    id: 'ondansetron',
    name: 'Ondansetrón',
    category: 'Antiemético',
    doseType: 'standard',
    mgPerKgMin: 0.15,
    mgPerKgMax: 0.15,
    maxSingleDoseMg: 8,
    maxDailyMgPerKg: 0.15,
    maxDailyMg: 8,
    frequencyText: 'Dosis oral única para vómitos por gastroenteritis aguda (no se recomienda repetir de rutina)',
    concentrationMgPerMl: 0.8, // 4 mg/5 mL
    concentrationLabel: '4 mg / 5 mL',
    indication:
      'Vómitos asociados a gastroenteritis aguda en niños ≥6 meses con deshidratación leve-moderada que interfiere con la rehidratación oral.',
    ageFlags: [
      ageFlag(6, 'caution', 'Recomendado a partir de los 6 meses; datos de seguridad limitados por debajo de esa edad.'),
    ],
    generalWarning: 'Dosificación alternativa por tramos de peso: 8–15 kg → 2 mg; 16–30 kg → 4 mg; >30 kg → 8 mg. El uso de dosis adicionales se asocia a mayor riesgo de diarrea. Precaución en síndrome de QT largo o uso concomitante de fármacos que lo prolonguen.',
    source: { label: 'AEP · Pediamécum — Ondansetrón', url: 'https://www.aeped.es/comite-medicamentos/pediamecum/ondansetron' },
  },
  {
    id: 'difenhidramina',
    name: 'Difenhidramina',
    category: 'Antihistamínico',
    doseType: 'standard',
    mgPerKgMin: 1.25,
    mgPerKgMax: 1.25,
    maxSingleDoseMg: 50,
    maxDailyMgPerKg: 5,
    maxDailyMg: 150,
    frequencyText: 'Cada 6 horas',
    concentrationMgPerMl: 2.5, // 12.5 mg/5 mL
    concentrationLabel: '12.5 mg / 5 mL',
    indication:
      'Reacciones alérgicas, urticaria y prurito. Su efecto sedante puede ser útil o indeseado según el contexto.',
    ageFlags: [
      ageFlag(24, 'caution', 'Evitar en menores de 2 años salvo indicación médica estricta: mayor riesgo de sedación excesiva o reacciones paradójicas. Distintas guías (p. ej. uso pediátrico en EE. UU.) desaconsejan además su uso rutinario en menores de 6 años.'),
    ],
    generalWarning: 'Dosis máxima diaria de 150 mg/día según Pediamécum (algunas fuentes citan hasta 300 mg/día). Para insomnio se usa 1 mg/kg/dosis (máx. 50 mg) antes de acostarse. Evitar combinar con otros depresores del SNC.',
    source: { label: 'AEP · Pediamécum — Difenhidramina', url: `${AEP_BASE}/difenhidramina` },
  },
  {
    id: 'prednisolona',
    name: 'Prednisolona',
    category: 'Corticosteroide',
    doseType: 'standard',
    mgPerKgMin: 1,
    mgPerKgMax: 2,
    maxSingleDoseMg: 60,
    maxDailyMgPerKg: 2,
    maxDailyMg: 60,
    frequencyText: 'Dividido cada 12 horas, en ciclos cortos (crisis asmática)',
    concentrationMgPerMl: 3, // 15 mg/5 mL
    concentrationLabel: '15 mg / 5 mL',
    indication:
      'Crisis asmática, laringitis/crup moderado-severo y reacciones alérgicas significativas.',
    ageFlags: [
      ageFlag(6, 'caution', 'En menores de 6 meses evaluar cuidadosamente el riesgo/beneficio con especialista.'),
    ],
    generalWarning: 'Es la forma activa de la prednisona; su acción y potencia se consideran equivalentes. Usar en ciclos cortos guiados por indicación médica; evitar uso prolongado sin supervisión.',
    source: { label: 'AEP · Pediamécum — Prednisolona', url: `${AEP_BASE}/prednisolona` },
  },
  {
    id: 'dexametasona',
    name: 'Dexametasona',
    category: 'Corticosteroide',
    doseType: 'standard',
    mgPerKgMin: 0.15,
    mgPerKgMax: 0.6,
    maxSingleDoseMg: 10,
    maxDailyMgPerKg: 0.6,
    maxDailyMg: 10,
    frequencyText: 'Dosis única para crup (puede repetirse a las 12–24 h si el médico lo indica); en crisis asmática 0,6 mg/kg/día durante 1–2 días',
    concentrationMgPerMl: 1, // presentación líquida ~1 mg/mL (varía según preparado)
    concentrationLabel: '1 mg / mL (referencial, varía según preparado)',
    indication:
      'Crup (laringotraqueítis) moderado a severo y crisis asmática; antiinflamatorio potente de acción prolongada.',
    ageFlags: [
      ageFlag(3, 'caution', 'En menores de 3 meses valorar riesgo-beneficio junto con especialista.'),
    ],
    generalWarning: 'La evidencia muestra que la dosis baja (0,15 mg/kg) es tan eficaz como dosis mayores (0,3–0,6 mg/kg); inicio de acción en 1–3 horas y efecto de hasta 24 horas. Evitar ciclos repetidos sin reevaluación médica.',
    source: { label: 'AEP · Pediamécum — Dexametasona', url: 'https://www.aeped.es/comite-medicamentos/pediamecum/dexametasona' },
  },
]
