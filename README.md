# PedMed

Calculadora de dosis de medicamentos pediátricos por peso, construida en React (Vite + JSX).

A partir del **peso** (y opcionalmente la **edad**) del paciente, la aplicación calcula la dosis
recomendada de antipiréticos, analgésicos, antibióticos, antieméticos, antihistamínicos,
corticosteroides y muchas otras categorías, e indica el nivel de **seguridad por edad** (sin
restricción, precaución o contraindicado) para cada medicamento.

> ⚠️ **Aviso importante:** esta herramienta es solo con fines educativos y de apoyo. No
> sustituye el criterio clínico, la ficha técnica del medicamento ni la evaluación de un
> médico o farmacéutico. Verifique siempre las dosis antes de administrar cualquier
> medicamento a un paciente pediátrico.

> 🖥️ **¿Buscas la versión de Windows sin conexión?** Ver
> [`windows-app/`](windows-app/README.md) — una app nativa en C#/WPF que
> funciona 100% offline, con exactamente los mismos medicamentos y cálculos
> que esta app web (los datos se generan automáticamente desde
> `src/data/medications.js`, sin transcripción manual).

## Dos calculadoras independientes

La aplicación está dividida en dos pestañas, cada una con su **propio** formulario de peso/edad
(el valor ingresado en una no afecta a la otra):

- **Principal (Ambulatorio / Urgencias):** medicamentos de uso ambulatorio y de urgencias
  (antipiréticos, analgésicos, antibióticos orales/IM de dosis única, antieméticos,
  antihistamínicos, corticosteroides, broncodilatadores, laxantes, anticonvulsivos de primera
  línea, antídotos de urgencias, drogas de reanimación, etc.).
- **Hospitalización / UCI / Quirófano:** medicamentos de uso **exclusivamente hospitalario**
  (anestesia, sedación, relajantes musculares, vasopresores e infusiones IV continuas,
  antiarrítmicos especializados y antibióticos IV de infecciones graves). Estas tarjetas llevan
  una cinta morada de aviso; los opioides/sedantes controlados llevan además una cinta naranja.

> La clasificación entre pestañas es una guía general basada en el contexto de uso habitual de
> cada fármaco (vía de administración, necesidad de monitorización o de vía aérea asegurada), no
> una regla clínica absoluta: el criterio del profesional a cargo siempre prevalece.

## Características

- Cálculo de dosis por peso en distintas unidades (mg, mcg, mL, mEq, U) con topes de dosis
  máxima por administración y diaria.
- Tasas de infusión continua (mcg/kg/min, U/kg/h) calculadas para el peso del paciente.
- Dosis fijas por tramo de edad o de peso para fármacos que no se dosifican de forma lineal
  (p. ej. laxantes pediátricos, antieméticos de dosis fija).
- Equivalente en mL según la concentración típica de cada suspensión pediátrica, cuando aplica.
- Validación de seguridad por edad (contraindicado / precaución / sin restricción) con
  explicación de cada alerta.
- Enlaces a la fuente (o fuentes) de cada medicamento directamente en su tarjeta.

## Fuentes de datos

- [Pediamécum](https://www.aeped.es/comites/cm/pediamecum) — Asociación Española de Pediatría (AEP).
- [Guía-ABE](https://www.guia-abe.es/files/pdf/antibioticos_dosificacion_lactantes_ninos_2019.pdf) — Antibióticos: dosis en lactantes y niños (Grupo de Patología Infecciosa AEPap, 2019).
- [Stony Brook Medicine — Anesthesiology, Peds Drug Dosages](https://renaissance.stonybrookmedicine.edu/anesthesiology/teaching/peds-drug-dosages) — referencia de dosis pediátricas de anestesiología/cuidados críticos.
- [Guía Rápida de Dosificación en Pediatría](https://www.guiafarmapediatrica.es/indice/antihistaminicos-h1-orales) — antihistamínicos H1 orales de 1ª y 2ª generación.

Cuando un medicamento se enriqueció con más de una fuente, la tarjeta muestra todos los enlaces.
Además, se agregaron advertencias de seguridad vigentes que las fuentes originales no
mencionaban explícitamente (p. ej. contraindicación de codeína/prometazina por edad, riesgo de
succinilcolina en miopatías no diagnosticadas, síndrome de infusión de propofol, retiro del
mercado de aprotinina y ranitidina, entre otras). La ranitidina fue excluida deliberadamente por
haber sido retirada del mercado mundial en 2020 por contaminación con NDMA.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- npm (incluido con Node.js)

## Instalación y ejecución en desarrollo

```bash
npm install
npm run dev
```

Esto inicia un servidor local (por defecto en `http://localhost:5173`). Abre esa dirección en
tu navegador para usar la aplicación.

Para generar una versión de producción:

```bash
npm run build
npm run preview
```

## Cómo usar la aplicación en iPhone/iPad (iOS)

PedMed es una **aplicación web** (no una app nativa de la App Store), por lo que en iOS se
usa a través de Safari. Hay dos formas de acceder a ella desde un dispositivo iOS:

### Opción A: Acceder a una versión publicada en internet

Si el proyecto ya está desplegado en un servicio de hosting (por ejemplo GitHub Pages, Vercel o
Netlify), simplemente:

1. Abre **Safari** en tu iPhone o iPad.
2. Ingresa la URL donde está publicada la aplicación.
3. (Opcional) Agrégala a tu pantalla de inicio para que se abra como una app:
   - Toca el botón de **compartir** (el ícono del cuadrado con la flecha hacia arriba).
   - Selecciona **"Agregar a pantalla de inicio"**.
   - Confirma el nombre y toca **"Agregar"**.
   - Aparecerá un ícono de PedMed en tu pantalla de inicio; al abrirlo se verá en pantalla
     completa, sin la barra de direcciones de Safari.

### Opción B: Acceder desde un servidor de desarrollo en tu red local

Si estás corriendo la app en tu computadora con `npm run dev` y quieres probarla desde tu
iPhone/iPad conectado a la **misma red Wi-Fi**:

1. En la computadora, inicia el servidor exponiéndolo a la red local:

   ```bash
   npm run dev -- --host
   ```

2. Vite mostrará una URL de red, similar a `http://192.168.1.XX:5173`.
3. En tu iPhone/iPad, abre **Safari** y escribe esa misma URL (debe estar en la misma red
   Wi-Fi que la computadora).
4. Igual que en la Opción A, puedes usar "Agregar a pantalla de inicio" para acceder más
   rápido la próxima vez.

> **Nota:** algunos routers/redes con "aislamiento de clientes" bloquean la comunicación
> entre dispositivos en la misma Wi-Fi. Si la URL de red no carga, verifica la configuración
> del router o usa la Opción A con la app ya desplegada.

## Estructura del proyecto

```
src/
├── App.jsx                        # Pestañas Principal / Hospitalización y disclaimers
├── main.jsx                       # Punto de entrada de React
├── index.css                      # Estilos de la aplicación
├── data/
│   └── medications.js             # Datos de dosificación, categorías y reglas de seguridad
├── utils/
│   └── doseCalculator.js          # Lógica de cálculo de dosis (mg/kg, mcg/kg, infusiones, tramos)
└── components/
    ├── DoseCalculatorPanel.jsx    # Formulario de peso/edad + listado de categorías de una pestaña
    ├── PatientForm.jsx            # Campos de peso y edad del paciente
    ├── MedicationCard.jsx         # Tarjeta con la dosis calculada de cada medicamento
    └── SafetyBadge.jsx            # Etiqueta visual de nivel de seguridad por edad
```

## Listado completo de medicamentos

169 medicamentos en 17 categorías. Se indica entre paréntesis la pestaña donde aparece cada uno:
**(P)** Principal (Ambulatorio/Urgencias) o **(H)** Hospitalización/UCI/Quirófano.

### Antipirético / Analgésico
Paracetamol (Acetaminofén) (P) · Ibuprofeno (P) · Ketorolaco (P) · Celecoxib (P)

### Analgésico opioide
Codeína (P) · Fentanilo (P) · Hidrocodona / Oxicodona (P) · Hidromorfona (P) · Meperidina (P) ·
Morfina (P) · Nalbufina (P) · Alfentanilo (H) · Metadona (H) · Remifentanilo (H) · Sufentanilo (H)

### Antibiótico
Amoxicilina (P) · Amoxicilina/Ácido clavulánico (P) · Azitromicina (P) · Cefadroxilo (P) ·
Cefalexina (P) · Cefixima (P) · Cefpodoxima (P) · Ceftibuteno (P) · Ceftriaxona (P) ·
Cefuroxima axetilo (P) · Ciprofloxacino (P) · Claritromicina (P) · Clindamicina (P) ·
Cloxacilina (P) · Cotrimoxazol (Trimetoprim-Sulfametoxazol) (P) · Trimetoprim (P) ·
Doxiciclina (P) · Eritromicina (P) · Etambutol (P) · Fosfomicina (P) · Fosfomicina/Trometamol (P) ·
Isoniacida (P) · Josamicina (P) · Linezolid (P) · Metronidazol (P) · Midecamicina (P) ·
Nitrofurantoína (P) · Penicilina G (P) · Penicilina G-benzatina (P) · Penicilina V (P) ·
Pirazinamida (P) · Rifampicina (P) · Sulfadiazina (P) · Telitromicina (P) · Amikacina (H) ·
Ampicilina (H) · Ampicilina/Sulbactam (Unasyn) (H) · Cefazolina (H) · Cefepima (H) ·
Cefonicid (H) · Cefotaxima (H) · Ceftazidima (H) · Cefuroxima IV (H) · Ertapenem (H) ·
Estreptomicina (H) · Gentamicina (H) · Imipenem (H) · Meropenem (H) ·
Piperacilina/Tazobactam (Zosyn) (H) · Teicoplanina (H) · Tobramicina (H) · Vancomicina (H)

### Antiemético
Ondansetrón (P) · Granisetrón (P) · Metoclopramida (P) · Omeprazol (P) · Proclorperazina (P) ·
Prometazina (P) · Trimetobenzamida (P)

### Antihistamínico / Antipruriginoso
Difenhidramina (P) · Hidroxizina (P) · Dexclorfeniramina (P) · Ketotifeno (P) · Cetirizina (P) ·
Desloratadina (P) · Ebastina (P) · Levocetirizina (P) · Loratadina (P) · Mequitazina (P) ·
Rupatadina (P)

### Corticosteroide
Prednisolona (P) · Dexametasona (P) · Hidrocortisona (P) · Metilprednisolona (P)

### Broncodilatador
Albuterol (Salbutamol) nebulizado (P) · Epinefrina 1:1,000 subcutánea (P) ·
Epinefrina racémica nebulizada (P) · Metaproterenol nebulizado (P) · Terbutalina subcutánea (P) ·
Aminofilina (H) · Isoproterenol (H)

### Laxante
Bisacodilo (P) · Docusato sódico (P) · Senna (P)

### Anticonvulsivo
Diazepam (P) · Lorazepam (P) · Fenobarbital (P) · Fenitoína (P)

### Antihipertensivo
Captopril (P) · Nifedipina (P) · Diazóxido (H) · Fentolamina (H) · Hidralazina (H) · Labetalol (H)

### Cardiovascular / Antiarrítmico
Adenosina (P) · Amiodarona (P) · Diltiazem (P) · Lidocaína (antiarrítmico/reanimación) (P) ·
Sulfato de magnesio (P) · Verapamilo (P) · Amrinona (Inamrinona) (H) · Aprotinina (H) ·
Digoxina (H) · Dobutamina (H) · Dopamina (H) · Epinefrina (infusión IV) (H) · Esmolol (H) ·
Fenilefrina (H) · Milrinona (H) · Nitroglicerina (H) · Nitroprusiato (H) · Norepinefrina (H) ·
Procainamida (H) · Propranolol IV (H) · Prostaglandina E1 (Alprostadil) (H) · Vasopresina (H)

### Diurético
Espironolactona (Aldactona) (P) · Clorotiazida (P) · Furosemida (P) · Manitol (H)

### Sedante / Anestésico IV
Hidrato de cloral (P) · Clonidina (sedación) (P) · Ketamina (P) · Midazolam (P) · Etomidato (H) ·
Haloperidol (H) · Metohexital (H) · Pentobarbital (H) · Propofol (H) · Tiopental (H)

### Relajante muscular
Cisatracurio (H) · Metocurina (Metubina) (H) · Mivacurio (H) · Pancuronio (H) · Rocuronio (H) ·
Succinilcolina (H) · Vecuronio (H)

### Reversión / Antídoto
Flumazenil (P) · Naloxona (P) · Atropina (reversión neuromuscular) (H) · Edrofonio (H) ·
Fisostigmina (H) · Glicopirrolato (H) · Neostigmina (H)

### Resucitación y emergencias
Atropina (bradicardia/paro cardiaco) (P) · Bicarbonato de sodio (P) · Cloruro de calcio 10% (P) ·
Gluconato de calcio 10% (P) · Dextrosa (P) · Efedrina (P) · Epinefrina 1:10,000 (paro cardiaco) (P)

### Misceláneo
Dantroleno (H) · Heparina (H) · Insulina (infusión IV) (H)

## Descargo de responsabilidad

Los rangos de mg/kg, dosis máximas y umbrales de edad son valores de referencia general
tomados de formularios pediátricos y de anestesiología comúnmente citados, pero pueden variar
según el protocolo institucional, la indicación específica y la presentación comercial
disponible en cada país. La clasificación de cada fármaco entre "Principal" y
"Hospitalización/UCI/Quirófano" es orientativa. Esta aplicación no ha sido validada
clínicamente y **no debe usarse como única fuente para decisiones de dosificación real**, en
particular para los medicamentos de uso hospitalario/anestesiología, que requieren
administración por personal entrenado en un entorno monitorizado.
