# PedMed

Calculadora de dosis de medicamentos pediátricos por peso, construida en React (Vite + JSX).

A partir del **peso** (y opcionalmente la **edad**) del paciente, la aplicación calcula la dosis
recomendada de antipiréticos, analgésicos, antibióticos, antieméticos, antihistamínicos y
corticosteroides, e indica el nivel de **seguridad por edad** (sin restricción, precaución o
contraindicado) para cada medicamento.

> ⚠️ **Aviso importante:** esta herramienta es solo con fines educativos y de apoyo. No
> sustituye el criterio clínico, la ficha técnica del medicamento ni la evaluación de un
> médico o farmacéutico. Verifique siempre las dosis antes de administrar cualquier
> medicamento a un paciente pediátrico.

## Características

- Cálculo de dosis por peso (mg/kg) con topes de dosis máxima por administración y diaria.
- Equivalente en mL según la concentración típica de cada suspensión pediátrica.
- Validación de seguridad por edad (contraindicado / precaución / sin restricción) con
  explicación de cada alerta.
- Cobertura de 9 medicamentos en 5 categorías: antipirético/analgésico, antibiótico,
  antiemético, antihistamínico y corticosteroide.

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

Si el proyecto ya está desplegado en un servicio de hosting (por ejemplo Vercel, Netlify o
GitHub Pages), simplemente:

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
├── App.jsx                     # Componente principal y estado del formulario
├── main.jsx                    # Punto de entrada de React
├── index.css                   # Estilos de la aplicación
├── data/
│   └── medications.js          # Datos de dosificación y reglas de seguridad por edad
├── utils/
│   └── doseCalculator.js       # Lógica de cálculo de dosis y validación por edad
└── components/
    ├── PatientForm.jsx         # Formulario de peso y edad del paciente
    ├── MedicationCard.jsx      # Tarjeta con la dosis calculada de cada medicamento
    └── SafetyBadge.jsx         # Etiqueta visual de nivel de seguridad por edad
```

## Descargo de responsabilidad

Los rangos de mg/kg, dosis máximas y umbrales de edad son valores de referencia general
tomados de formularios pediátricos comúnmente citados, pero pueden variar según el
protocolo institucional, la indicación específica y la presentación comercial disponible en
cada país. Esta aplicación no ha sido validada clínicamente y **no debe usarse como única
fuente para decisiones de dosificación real**.
