import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatarMoeda, ANO } from '../utils/calculos'

export default function HorasExtras() {
  const [form, setForm] = useState({
    salarioBruto: '',
    cargaHorariaMensal: '220',
    quantidadeHoras: '',
    percentualExtra: '50',
    percentualCustom: '',
    diasUteisMes: '22',
    diasDescansoMes: '8',
    calcularDSR: true,
  })
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleCalcular(e) {
    e.preventDefault()
    setErro('')
    setResultado(null)

    const bruto = parseFloat(form.salarioBruto)
    if (!bruto || bruto <= 0) {
      setErro('Informe o salário bruto.')
      return
    }

    const cargaHoraria = parseInt(form.cargaHorariaMensal)
    if (!cargaHoraria || cargaHoraria <= 0) {
      setErro('Informe a carga horária mensal.')
      return
    }

    const qtdHoras = parseFloat(form.quantidadeHoras)
    if (!qtdHoras || qtdHoras <= 0) {
      setErro('Informe a quantidade de horas extras.')
      return
    }

    const percentual = form.percentualExtra === 'custom'
      ? parseFloat(form.percentualCustom)
      : parseFloat(form.percentualExtra)

    if (!percentual || percentual <= 0) {
      setErro('Informe o percentual de hora extra.')
      return
    }

    const diasUteis = parseInt(form.diasUteisMes) || 22
    const diasDescanso = parseInt(form.diasDescansoMes) || 8

    // Cálculo
    const valorHoraNormal = bruto / cargaHoraria
    const acrescimoHoraExtra = valorHoraNormal * (percentual / 100)
    const valorHoraExtra = valorHoraNormal + acrescimoHoraExtra
    const totalHorasExtras = valorHoraExtra * qtdHoras

    // DSR (Descanso Semanal Remunerado)
    // DSR = (total horas extras / dias úteis) × dias de descanso
    let valorDSR = 0
    if (form.calcularDSR && diasUteis > 0) {
      valorDSR = (totalHorasExtras / diasUteis) * diasDescanso
    }

    const totalBruto = totalHorasExtras + valorDSR

    setResultado({
      valorHoraNormal: Math.round(valorHoraNormal * 100) / 100,
      acrescimoHoraExtra: Math.round(acrescimoHoraExtra * 100) / 100,
      valorHoraExtra: Math.round(valorHoraExtra * 100) / 100,
      totalHorasExtras: Math.round(totalHorasExtras * 100) / 100,
      valorDSR: Math.round(valorDSR * 100) / 100,
      totalBruto: Math.round(totalBruto * 100) / 100,
      qtdHoras,
      percentual,
      cargaHoraria,
      calcularDSR: form.calcularDSR,
    })

    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function handleLimpar() {
    setForm({
      salarioBruto: '', cargaHorariaMensal: '220', quantidadeHoras: '',
      percentualExtra: '50', percentualCustom: '', diasUteisMes: '22',
      diasDescansoMes: '8', calcularDSR: true,
    })
    setResultado(null)
    setErro('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-emerald-400 transition-colors">Início</Link>
          <span>/</span>
          <span className="text-gray-400">Horas Extras</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Calculadora de Horas Extras
        </h1>
        <p className="text-gray-400 text-lg">
          Calcule o valor das horas extras com adicional e DSR — tabelas <strong className="text-emerald-400">{ANO}</strong>.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleCalcular} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Salário Bruto */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Salário Bruto (R$)</label>
            <input
              type="number"
              name="salarioBruto"
              value={form.salarioBruto}
              onChange={handleChange}
              placeholder="Ex: 3000.00"
              step="0.01"
              min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          {/* Carga horária */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Carga horária mensal</label>
            <select
              name="cargaHorariaMensal"
              value={form.cargaHorariaMensal}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            >
              <option value="180" className="bg-[#1a1a2e]">180h (36h/semana)</option>
              <option value="200" className="bg-[#1a1a2e]">200h (40h/semana)</option>
              <option value="220" className="bg-[#1a1a2e]">220h (44h/semana — padrão CLT)</option>
            </select>
          </div>

          {/* Quantidade de horas extras */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Horas extras no mês</label>
            <input
              type="number"
              name="quantidadeHoras"
              value={form.quantidadeHoras}
              onChange={handleChange}
              placeholder="Ex: 20"
              step="0.5"
              min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          {/* Percentual */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Adicional de hora extra</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: '50', label: '50%', desc: 'Dias úteis' },
                { value: '100', label: '100%', desc: 'Dom/feriados' },
                { value: 'custom', label: 'Outro', desc: 'Personalizado' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex flex-col items-center p-2.5 rounded-xl border cursor-pointer transition-all text-center ${
                    form.percentualExtra === opt.value
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="percentualExtra"
                    value={opt.value}
                    checked={form.percentualExtra === opt.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className={`text-sm font-bold ${form.percentualExtra === opt.value ? 'text-emerald-400' : 'text-white'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-gray-500">{opt.desc}</span>
                </label>
              ))}
            </div>
            {form.percentualExtra === 'custom' && (
              <input
                type="number"
                name="percentualCustom"
                value={form.percentualCustom}
                onChange={handleChange}
                placeholder="Ex: 75"
                min="1"
                className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
              />
            )}
          </div>

          {/* DSR */}
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 cursor-pointer hover:border-white/10 transition-all">
              <input
                type="checkbox"
                name="calcularDSR"
                checked={form.calcularDSR}
                onChange={handleChange}
                className="accent-emerald-500 w-4 h-4"
              />
              <div>
                <span className="text-gray-300 text-sm">Calcular DSR (Descanso Semanal Remunerado)</span>
                <p className="text-gray-600 text-xs">O DSR é o reflexo das horas extras nos domingos e feriados</p>
              </div>
            </label>
          </div>

          {/* Dias úteis e descanso (se DSR ativo) */}
          {form.calcularDSR && (
            <>
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Dias úteis no mês</label>
                <input
                  type="number"
                  name="diasUteisMes"
                  value={form.diasUteisMes}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Domingos e feriados no mês</label>
                <input
                  type="number"
                  name="diasDescansoMes"
                  value={form.diasDescansoMes}
                  onChange={handleChange}
                  min="0"
                  max="15"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                />
              </div>
            </>
          )}
        </div>

        {/* Error */}
        {erro && (
          <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            <p className="text-rose-400 text-sm">{erro}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200 text-base"
          >
            Calcular Horas Extras
          </button>
          <button
            type="button"
            onClick={handleLimpar}
            className="px-6 py-3.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
          >
            Limpar
          </button>
        </div>
      </form>

      {/* Results */}
      {resultado && (
        <div id="resultado" className="space-y-4">
          {/* Total card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 text-center">
            <p className="text-emerald-400/80 text-sm font-medium mb-1 uppercase tracking-wider">Total bruto de horas extras</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
              {formatarMoeda(resultado.totalBruto)}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span>{resultado.qtdHoras}h extras × {resultado.percentual}%</span>
              {resultado.calcularDSR && (
                <>
                  <span className="text-white/10">|</span>
                  <span>DSR: {formatarMoeda(resultado.valorDSR)}</span>
                </>
              )}
            </div>
          </div>

          {/* Detalhamento */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold">Detalhamento</h3>
            </div>
            <div className="divide-y divide-white/5">
              <div className="px-6 py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-gray-300 text-sm">Valor da hora normal</span>
                  <span className="text-gray-600 text-xs ml-2">(salário ÷ {resultado.cargaHoraria}h)</span>
                </div>
                <span className="text-white font-semibold text-sm tabular-nums">{formatarMoeda(resultado.valorHoraNormal)}</span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-gray-300 text-sm">Acréscimo por hora extra</span>
                  <span className="text-gray-600 text-xs ml-2">({resultado.percentual}%)</span>
                </div>
                <span className="text-emerald-400 font-semibold text-sm tabular-nums">+ {formatarMoeda(resultado.acrescimoHoraExtra)}</span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between bg-white/[0.02]">
                <span className="text-white font-bold text-sm">Valor da hora extra</span>
                <span className="text-emerald-400 font-bold tabular-nums">{formatarMoeda(resultado.valorHoraExtra)}</span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-gray-300 text-sm">Total horas extras</span>
                  <span className="text-gray-600 text-xs ml-2">({resultado.qtdHoras}h × {formatarMoeda(resultado.valorHoraExtra)})</span>
                </div>
                <span className="text-emerald-400 font-semibold text-sm tabular-nums">{formatarMoeda(resultado.totalHorasExtras)}</span>
              </div>
              {resultado.calcularDSR && (
                <div className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-gray-300 text-sm">DSR sobre horas extras</span>
                    <span className="text-gray-600 text-xs ml-2">(reflexo nos descansos)</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-sm tabular-nums">+ {formatarMoeda(resultado.valorDSR)}</span>
                </div>
              )}
              <div className="px-6 py-3.5 flex items-center justify-between bg-emerald-500/5">
                <span className="text-white font-bold">Total bruto</span>
                <span className="text-emerald-400 font-bold text-lg tabular-nums">{formatarMoeda(resultado.totalBruto)}</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl px-6 py-4">
            <p className="text-blue-400 text-sm">
              ℹ️ Este valor é <strong>bruto</strong> — será somado ao salário mensal e os descontos de INSS e IR são calculados sobre o total. Use a <Link to="/salario-liquido" className="underline hover:text-blue-300">Calculadora de Salário Líquido</Link> para ver o impacto no seu salário.
            </p>
          </div>

          {/* Premium CTA */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">⭐</div>
            <h3 className="text-white font-bold text-lg mb-1">Quer mais detalhes?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Exporte em PDF e simule diferentes cenários de horas extras com impacto no salário líquido.
            </p>
            <Link
              to="/premium"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm"
            >
              Conhecer o Premium
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
