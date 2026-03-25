import { useState, useRef } from 'react'

/**
 * Campo de data com formato dd/mm/aaaa
 * Máscara automática e conversão para formato ISO (yyyy-mm-dd) no onChange
 */
export default function DateInput({ name, value, onChange, className = '' }) {
  // value chega em formato ISO (yyyy-mm-dd), mostramos como dd/mm/aaaa
  const [display, setDisplay] = useState(() => isoToDisplay(value))
  const inputRef = useRef(null)

  function isoToDisplay(iso) {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    if (!y || !m || !d) return ''
    return `${d}-${m}-${y}`
  }

  function displayToIso(disp) {
    const clean = disp.replace(/\D/g, '')
    if (clean.length !== 8) return ''
    const d = clean.substring(0, 2)
    const m = clean.substring(2, 4)
    const y = clean.substring(4, 8)

    // Validação básica
    const dia = parseInt(d, 10)
    const mes = parseInt(m, 10)
    const ano = parseInt(y, 10)
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900 || ano > 2100) return ''

    return `${y}-${m}-${d}`
  }

  function handleInput(e) {
    let raw = e.target.value.replace(/\D/g, '') // só números
    if (raw.length > 8) raw = raw.substring(0, 8)

    // Aplicar máscara dd-mm-aaaa
    let masked = ''
    if (raw.length > 0) masked = raw.substring(0, 2)
    if (raw.length > 2) masked += '-' + raw.substring(2, 4)
    if (raw.length > 4) masked += '-' + raw.substring(4, 8)

    setDisplay(masked)

    // Converter para ISO e enviar ao form
    const iso = displayToIso(masked)
    onChange({
      target: {
        name,
        value: iso,
        type: 'text',
      }
    })
  }

  // Sincronizar se o value externo mudar (ex: limpar formulário)
  const displayFromValue = isoToDisplay(value)
  if (value === '' && display !== '') {
    // Reset
    setTimeout(() => setDisplay(''), 0)
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      placeholder="dd-mm-aaaa"
      maxLength={10}
      value={display}
      onChange={handleInput}
      className={className}
    />
  )
}
