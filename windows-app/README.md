# PedMed para Windows (offline, C# / WPF)

Versión nativa de escritorio de PedMed para Windows, escrita en C# (.NET 8 / WPF).
Funciona **completamente sin conexión a internet**: todos los datos de
medicamentos están embebidos en la aplicación, no se realiza ninguna llamada de
red.

> ⚠️ Mismo aviso que la app web: esta herramienta es solo con fines educativos
> y de apoyo. No sustituye el criterio clínico, la ficha técnica del
> medicamento ni la evaluación de un médico o farmacéutico.

## Estructura

```
windows-app/
├── PedMed.sln
├── PedMed.Core/                 # Biblioteca de clases portátil (sin dependencia de Windows)
│   ├── Models/Medication.cs      # Modelo de datos (mismo esquema que src/data/medications.js)
│   ├── Models/DoseResult.cs
│   ├── Data/MedicationsData.cs   # ⚠️ Generado — ver "Cómo actualizar los datos"
│   └── Services/DoseCalculator.cs  # Port fiel de src/utils/doseCalculator.js
├── PedMed.Core.Validator/       # Consola: valida los datos y el motor de cálculo
└── PedMed.Windows/               # App WPF (interfaz gráfica de Windows)
    ├── ViewModels/                # MVVM: un ViewModel independiente por pestaña/calculadora
    └── Views/PatientPanelView.xaml  # Formulario de peso/edad + tarjetas de medicamentos
```

`PedMed.Core` no referencia nada de WPF ni de Windows: contiene únicamente el
modelo de datos y la lógica de cálculo, por lo que es reutilizable (por
ejemplo, para una futura versión de consola, macOS con Avalonia, etc.) y se
puede compilar y probar en cualquier sistema operativo con el SDK de .NET.

## Requisitos para compilar y ejecutar en Windows

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (incluye el
  workload de escritorio de Windows necesario para WPF).
- Windows 10/11 (WPF es una tecnología exclusiva de Windows: la interfaz
  gráfica **no** se ejecuta en Linux/macOS, aunque el código de
  `PedMed.Core` sí se puede compilar y probar en cualquier plataforma).

## Cómo compilar y ejecutar

```powershell
cd windows-app
dotnet build
dotnet run --project PedMed.Windows
```

Para generar un ejecutable independiente (sin necesidad de instalar .NET en la
máquina destino):

```powershell
dotnet publish PedMed.Windows -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

El ejecutable resultante queda en
`PedMed.Windows/bin/Release/net8.0-windows/win-x64/publish/PedMed.Windows.exe`
y puede copiarse y ejecutarse en cualquier PC con Windows, sin instalar nada
más ni requerir conexión a internet.

## Cómo validar los datos (en cualquier sistema operativo)

```bash
cd windows-app
dotnet run --project PedMed.Core.Validator
```

Verifica que los 169 medicamentos tengan IDs únicos, categorías válidas y que
el motor de cálculo no arroje errores para una malla de pesos/edades — el
mismo tipo de chequeo que `npm run validate` en la app web.

## Cómo actualizar los datos de medicamentos

`PedMed.Core/Data/MedicationsData.cs` es un archivo **generado**: no editarlo
a mano. La fuente de verdad sigue siendo `src/data/medications.js` de la app
web (React). Para regenerar el archivo de C# después de modificar los datos
en la app web:

```bash
node scripts/generate-csharp-medications.mjs
```

Esto mantiene ambas apps (web y Windows) sincronizadas con exactamente los
mismos medicamentos, dosis y advertencias, sin transcripción manual.

## Diseño de la interfaz

La app replica la estructura de la web: dos pestañas, cada una con su propio
formulario de peso/edad independiente (sin estado compartido entre ellas):

- **Principal (Ambulatorio / Urgencias)**
- **Hospitalización / UCI / Quirófano** (con aviso destacado adicional y
  cintas visuales de "solo uso hospitalario" / "medicamento controlado" en
  las tarjetas correspondientes)

## Estado de las pruebas

Este proyecto se desarrolló y compiló en un entorno Linux sin acceso a
Windows, usando `EnableWindowsTargeting` para poder compilar (no ejecutar)
proyectos WPF fuera de Windows. Se verificó exhaustivamente:

- Compilación limpia de las 3 proyectos (`PedMed.Core`, `PedMed.Core.Validator`,
  `PedMed.Windows`), incluida la compilación de XAML.
- Los 169 medicamentos validados sin errores (`PedMed.Core.Validator`).
- Comparación cruzada manual de varios casos representativos (todos los
  `DoseType`) contra los resultados exactos de `doseCalculator.js` en la app
  web: coinciden.
- Revisión manual de cada `{Binding ...}` en el XAML contra las propiedades
  expuestas por los ViewModels correspondientes.

Lo que **no** se pudo verificar en este entorno, por requerir Windows:

- Renderizado visual real de la ventana (layout, espaciado, que no haya
  recortes de texto, etc.).
- Comportamiento en tiempo de ejecución de la interfaz (que los enlaces de
  fuente abran el navegador correctamente, que el cambio de pestañas se
  sienta fluido, etc.).

Se recomienda ejecutar la app en Windows y reportar cualquier ajuste visual
necesario antes de considerarla lista para distribución.
