// Datos de referencia general para uso educativo. No sustituyen el criterio
// clínico ni las fichas técnicas/formularios pediátricos vigentes.
// Los rangos mg/kg, dosis máximas y umbrales de edad son valores de
// referencia ampliamente citados en formularios pediátricos, pero pueden
// variar según protocolo institucional, indicación específica y presentación
// comercial disponible en cada país.

export const CATEGORIES = [
  'Antipirético / Analgésico',
  'Antibiótico',
  'Antiemético',
  'Antihistamínico',
  'Corticosteroide',
]

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
    maxDailyMgPerKg: 75,
    maxDailyMg: 4000,
    frequencyText: 'Cada 4–6 horas (máx. 5 dosis/día)',
    concentrationMgPerMl: 32, // suspensión típica 160 mg/5 mL
    concentrationLabel: '160 mg / 5 mL',
    indication:
      'Fiebre y dolor leve a moderado. Es el antipirético/analgésico de primera línea en pediatría por su amplio margen de seguridad.',
    ageFlags: [
      ageFlag(3, 'caution', 'En menores de 3 meses usar solo bajo supervisión médica estricta, con intervalos más amplios (cada 6–8 h) y control estrecho.'),
    ],
    generalWarning: 'Evitar en insuficiencia hepática grave. Respetar el intervalo mínimo entre dosis para prevenir toxicidad hepática por acumulación.',
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
    maxDailyMg: 2400,
    frequencyText: 'Cada 6–8 horas',
    concentrationMgPerMl: 20, // 100 mg/5 mL
    concentrationLabel: '100 mg / 5 mL',
    indication:
      'Fiebre, dolor y procesos con componente inflamatorio. Alternativa al paracetamol cuando no hay contraindicación.',
    ageFlags: [
      ageFlag(6, 'contraindicated', 'Contraindicado en menores de 6 meses (datos de seguridad insuficientes y mayor riesgo renal).'),
    ],
    generalWarning: 'Evitar en deshidratación, varicela activa, insuficiencia renal o antecedente de sangrado gastrointestinal.',
  },
  {
    id: 'amoxicilina',
    name: 'Amoxicilina',
    category: 'Antibiótico',
    doseType: 'standard',
    mgPerKgMin: 25,
    mgPerKgMax: 50,
    maxSingleDoseMg: 875,
    maxDailyMgPerKg: 50,
    maxDailyMg: 3000,
    frequencyText: 'Cada 8–12 horas (dividido en 2–3 dosis/día)',
    concentrationMgPerMl: 50, // 250 mg/5 mL
    concentrationLabel: '250 mg / 5 mL',
    indication:
      'Infecciones respiratorias, óticas (otitis media aguda) y urinarias por gérmenes sensibles.',
    ageFlags: [
      ageFlag(1, 'caution', 'En neonatos (<1 mes) ajustar dosis e intervalo según edad gestacional y postnatal; requiere supervisión médica.'),
    ],
    generalWarning: 'En otitis media aguda algunos protocolos usan dosis alta (80–90 mg/kg/día). Contraindicada en alergia confirmada a penicilinas.',
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
    frequencyText: '1 vez al día: día 1 dosis de carga, días 2–5 dosis de mantenimiento',
    concentrationMgPerMl: 40, // 200 mg/5 mL
    concentrationLabel: '200 mg / 5 mL',
    indication:
      'Alternativa en alergia a penicilinas; neumonía atípica e infecciones de vías respiratorias.',
    ageFlags: [
      ageFlag(1.5, 'caution', 'Precaución en menores de 6 semanas por riesgo descrito de estenosis pilórica hipertrófica.'),
    ],
    generalWarning: 'Vigilar intervalo QT en pacientes con cardiopatía o uso concomitante de otros fármacos que lo prolonguen.',
  },
  {
    id: 'cefalexina',
    name: 'Cefalexina',
    category: 'Antibiótico',
    doseType: 'standard',
    mgPerKgMin: 25,
    mgPerKgMax: 50,
    maxSingleDoseMg: 1000,
    maxDailyMgPerKg: 100,
    maxDailyMg: 4000,
    frequencyText: 'Cada 6–8 horas (dividido en 3–4 dosis/día)',
    concentrationMgPerMl: 50, // 250 mg/5 mL
    concentrationLabel: '250 mg / 5 mL',
    indication:
      'Infecciones de piel y tejidos blandos, vías urinarias y faringoamigdalitis (como segunda línea).',
    ageFlags: [
      ageFlag(1, 'caution', 'Uso en menores de 1 mes solo bajo supervisión médica especializada.'),
    ],
    generalWarning: 'Ajustar dosis en insuficiencia renal. Precaución en alergia cruzada con penicilinas.',
  },
  {
    id: 'ondansetron',
    name: 'Ondansetrón',
    category: 'Antiemético',
    doseType: 'standard',
    mgPerKgMin: 0.15,
    mgPerKgMax: 0.15,
    maxSingleDoseMg: 8,
    maxDailyMgPerKg: 0.45,
    maxDailyMg: 24,
    frequencyText: 'Dosis única; puede repetirse cada 8 horas si es necesario',
    concentrationMgPerMl: 0.8, // 4 mg/5 mL
    concentrationLabel: '4 mg / 5 mL',
    indication:
      'Náuseas y vómitos, especialmente en gastroenteritis aguda y en el postoperatorio.',
    ageFlags: [
      ageFlag(6, 'caution', 'Datos de seguridad limitados en menores de 6 meses; usar solo bajo indicación médica expresa.'),
    ],
    generalWarning: 'Precaución en síndrome de QT largo o uso concomitante de otros fármacos que prolonguen el QT.',
  },
  {
    id: 'difenhidramina',
    name: 'Difenhidramina',
    category: 'Antihistamínico',
    doseType: 'standard',
    mgPerKgMin: 1,
    mgPerKgMax: 1.25,
    maxSingleDoseMg: 50,
    maxDailyMgPerKg: 5,
    maxDailyMg: 300,
    frequencyText: 'Cada 6 horas',
    concentrationMgPerMl: 2.5, // 12.5 mg/5 mL
    concentrationLabel: '12.5 mg / 5 mL',
    indication:
      'Reacciones alérgicas, urticaria y prurito. Su efecto sedante puede ser útil o indeseado según el contexto.',
    ageFlags: [
      ageFlag(24, 'caution', 'Evitar en menores de 2 años salvo indicación médica estricta: mayor riesgo de sedación excesiva o reacciones paradójicas.'),
    ],
    generalWarning: 'Evitar combinar con otros depresores del SNC. No usar como sedante de rutina.',
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
    frequencyText: 'Una vez al día o dividido cada 12 horas, en ciclos cortos',
    concentrationMgPerMl: 3, // 15 mg/5 mL
    concentrationLabel: '15 mg / 5 mL',
    indication:
      'Crisis asmática, laringitis/crup moderado-severo y reacciones alérgicas significativas.',
    ageFlags: [
      ageFlag(6, 'caution', 'En menores de 6 meses evaluar cuidadosamente el riesgo/beneficio con especialista.'),
    ],
    generalWarning: 'Usar en ciclos cortos guiados por indicación médica; evitar uso prolongado sin supervisión.',
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
    frequencyText: 'Dosis única (puede repetirse a las 12–24 h si el médico lo indica)',
    concentrationMgPerMl: 1, // presentación líquida ~1 mg/mL (varía según preparado)
    concentrationLabel: '1 mg / mL (referencial, varía según preparado)',
    indication:
      'Crup (laringotraqueítis) moderado a severo; antiinflamatorio potente de acción prolongada.',
    ageFlags: [
      ageFlag(3, 'caution', 'En menores de 3 meses valorar riesgo-beneficio junto con especialista.'),
    ],
    generalWarning: 'Dosis única generalmente suficiente para crup; evitar ciclos repetidos sin reevaluación médica.',
  },
]
