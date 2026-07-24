import { useState } from 'react'

const MAX_SUGGESTIONS = 8

export default function MedicationSearchBox({ idPrefix, query, onQueryChange, matches }) {
  const [isOpen, setIsOpen] = useState(false)
  const inputId = `${idPrefix}-med-search`

  const suggestions = query.trim() ? matches.slice(0, MAX_SUGGESTIONS) : []
  const showSuggestions = isOpen && suggestions.length > 0

  function selectSuggestion(med) {
    onQueryChange(med.name)
    setIsOpen(false)
    document.getElementById(`${idPrefix}-med-${med.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="med-search">
      <label htmlFor={inputId}>Buscar medicamento</label>
      <div className="med-search-input-wrap">
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          placeholder="Ej. amoxicilina..."
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        />
        {query && (
          <button
            type="button"
            className="med-search-clear"
            aria-label="Borrar búsqueda"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onQueryChange('')}
          >
            ×
          </button>
        )}
        {showSuggestions && (
          <ul className="med-search-suggestions" role="listbox">
            {suggestions.map((med) => (
              <li key={med.id}>
                <button
                  type="button"
                  role="option"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(med)}
                >
                  {med.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {query.trim() && (
        <p className="field-hint">
          {matches.length === 0
            ? 'Ningún medicamento coincide con la búsqueda.'
            : `${matches.length} medicamento${matches.length === 1 ? '' : 's'} coincide${matches.length === 1 ? '' : 'n'}.`}
        </p>
      )}
    </div>
  )
}
