import { useMemo, useState } from 'react'
import DoseCalculatorPanel from './components/DoseCalculatorPanel'
import NeonatalCalculatorPanel from './components/NeonatalCalculatorPanel'
import { MEDICATIONS } from './data/medications'

const TABS = [
  {
    id: 'principal',
    label: 'Principal (Ambulatorio / Urgencias)',
    venue: 'principal',
  },
  {
    id: 'hospital',
    label: 'Hospitalización / UCI / Quirófano',
    venue: 'hospital',
  },
  {
    id: 'neonatologia',
    label: 'Neonatología (UCI neonatal)',
    venue: 'neonatal',
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('principal')

  const principalMeds = useMemo(
    () => MEDICATIONS.filter((m) => m.venue !== 'hospital' && m.venue !== 'neonatal'),
    []
  )
  const hospitalMeds = useMemo(() => MEDICATIONS.filter((m) => m.venue === 'hospital'), [])
  const neonatalMeds = useMemo(() => MEDICATIONS.filter((m) => m.venue === 'neonatal'), [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>PedMed</h1>
        <p className="subtitle">Calculadora de dosis pediátrica por peso</p>
        <p className="credit">Creado por Rodrigo Padilla</p>
      </header>

      <div className="disclaimer" role="alert">
        <strong>Aviso importante:</strong> esta herramienta es solo con fines educativos y de
        apoyo. No sustituye el criterio clínico, la ficha técnica del medicamento ni la
        evaluación de un médico o farmacéutico. Verifique siempre las dosis antes de administrar
        cualquier medicamento a un paciente pediátrico.
      </div>

      <nav className="tabs" role="tablist" aria-label="Ámbito de uso">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/*
        Ambos paneles permanecen montados (ocultos con CSS en lugar de
        desmontados) para que cada pestaña conserve su propio peso/edad
        ingresado al cambiar entre ellas, en vez de perder los datos.
      */}
      <div className={activeTab === 'principal' ? '' : 'tab-panel-hidden'}>
        <p className="tab-description">
          Medicamentos de uso ambulatorio y de urgencias: antipiréticos, analgésicos,
          antibióticos, antieméticos y similares, con dosis calculadas por peso (y, cuando
          aplica, por edad).
        </p>
        <DoseCalculatorPanel medications={principalMeds} idPrefix="principal" />
      </div>

      <div className={activeTab === 'hospital' ? '' : 'tab-panel-hidden'}>
        <div className="disclaimer disclaimer-hospital" role="alert">
          <strong>Contenido de anestesiología/cuidados críticos:</strong> esta pestaña reúne
          fármacos de uso <strong>exclusivamente hospitalario</strong> (UCI, quirófano y
          planta de hospitalización): anestesia, sedación, relajantes musculares,
          vasopresores/infusiones IV, antiarrítmicos especializados y antibióticos IV de
          infecciones graves. Requieren vía IV/IM/IO, monitorización continua, capacidad de
          soporte de vía aérea y personal entrenado; no están pensados para administración en
          el hogar ni sin supervisión médica directa. Los opioides/sedantes controlados llevan
          además una cinta naranja distinta.
        </div>
        <p className="tab-description">
          Calculadora independiente para esta sección: el peso/edad ingresados aquí no afectan
          a la pestaña "Principal".
        </p>
        <DoseCalculatorPanel medications={hospitalMeds} idPrefix="hospital" />
      </div>

      <div className={activeTab === 'neonatologia' ? '' : 'tab-panel-hidden'}>
        <div className="disclaimer disclaimer-hospital" role="alert">
          <strong>Contenido de UCI neonatal:</strong> esta pestaña reúne fármacos dosificados
          según la <strong>edad gestacional al nacer</strong> y la <strong>edad postnatal</strong>{' '}
          del neonato (no por edad en meses/años como el resto de la app), de uso{' '}
          <strong>exclusivamente hospitalario</strong> en cuidados intensivos neonatales. La
          dosificación neonatal es especialmente sensible a errores: verifique siempre cada
          cálculo contra el protocolo de neonatología/farmacia de su institución antes de
          administrar cualquier medicamento.
        </div>
        <p className="tab-description">
          Calculadora independiente para esta sección: requiere peso actual, edad gestacional al
          nacer (semanas) y edad postnatal (días de vida). El peso/edad ingresados aquí no
          afectan a las demás pestañas.
        </p>
        <NeonatalCalculatorPanel medications={neonatalMeds} idPrefix="neonatologia" />
      </div>

      <footer className="app-footer">
        <p>
          Dosis basadas en el{' '}
          <a href="https://www.aeped.es/comites/cm/pediamecum" target="_blank" rel="noopener noreferrer">
            Pediamécum de la Asociación Española de Pediatría (AEP)
          </a>
          , la{' '}
          <a
            href="https://www.guia-abe.es/files/pdf/antibioticos_dosificacion_lactantes_ninos_2019.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Guía-ABE
          </a>{' '}
          y la referencia de dosis pediátricas de{' '}
          <a
            href="https://renaissance.stonybrookmedicine.edu/anesthesiology/teaching/peds-drug-dosages"
            target="_blank"
            rel="noopener noreferrer"
          >
            Anestesiología de Stony Brook Medicine
          </a>{' '}
          y, para la pestaña de Neonatología, la{' '}
          <a
            href="https://www.guia-abe.es/generalidades-antimicrobianos-dosis-en-neonatos"
            target="_blank"
            rel="noopener noreferrer"
          >
            Guía-ABE — dosis de antimicrobianos en neonatos
          </a>
          . Los valores pueden variar según protocolo institucional, indicación específica y
          presentación comercial disponible.
        </p>
      </footer>
    </div>
  )
}
