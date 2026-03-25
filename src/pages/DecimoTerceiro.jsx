import { useState } from 'react'
import { Link } from 'react-router-dom'
import { calcularINSS, calcularIRRF, formatarMoeda, ANO, TABELAS } from '../utils/calculos'

export default function DecimoTerceiro() {
  const [form, setForm] = useState({
    salarioBruto: '',
    mesesTrabalhados: '12',
    dependentes: '0',
  })
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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

    const meses = parseInt(form.mesesTrabalhados)
    if (meses < 1 || meses > 12) {
      setErro('Informe os meses trabalhados (1 a 12).')
      return
    }

    const dependentes = parseInt(form.dependentes) || 0

    // Valor total do 13º (proporcional)
    const valorTotal = (bruto / 12) * meses

    // 1ª PARCELA — paga até 30/novembro — sem descontos
    const primeiraParcela = valorTotal / 2

    // 2ª PARCELA — paga até 20/dezembro — com descontos sobre o TOTAL
    // INSS incide sobre o valor total do 13º
    const inss = calcularINSS(valorTotal)

    // IRRF incide sobre (total - INSS)
    const baseIR = valorTotal - inss
    const irrf = calcularIRRF(baseIR, dependentes)

    // 2ª parcela = total - 1ª parcela - descontos
    const segundaParcela = valorTotal - primeiraParcela - inss - irrf

    const totalLiquido = primeiraParcela + segundaParcela

    setResultado({
      valorTotal: Math.round(valorTotal * 100) / 100,
      primeiraParcela: Math.round(primeiraParcela * 100) / 100,
      segundaParcela: Math.round(segundaParcela * 100) / 100,
      inss: Math.round(inss * 100) / 100,
      irrf: Math.round(irrf * 100) / 100,
      totalDescontos: Math.round((inss + irrf) * 100) / 100,
      totalLiquido: Math.round(totalLiquido * 100) / 100,
      meses,
      baseIR: Math.round(baseIR * 100) / 100,
    })

    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function handleLimpar() {
    setForm({ salarioBruto: '', mesesTrabalhados: '12', dependentes: '0' })
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
          <span className="text-gray-400">13º Salário</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Calculadora de 13º Salário
        </h1>
        <p className="text-gray-400 text-lg">
          Simule a 1ª e 2ª parcelas do décimo terceiro com tabelas <strong className="text-emerald-400">{ANO}</strong>.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleCalcular} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

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

          {/* Meses trabalhados */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Meses trabalhados no ano</label>
            <select
              name="mesesTrabalhados"
              value={form.mesesTrabalhados}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                <option key={n} value={n} className="bg-[#1a1a2e]">{n} {n === 1 ? 'mês' : 'meses'} ({n}/12)</option>
              ))}
            </select>
          </div>

          {/* Dependentes */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Dependentes (IR)</label>
            <input
              type="number"
              name="dependentes"
              value={form.dependentes}
              onChange={handleChange}
              min="0"
              max="20"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            />
          </div>
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
            Calcular 13º Salário
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
            <p className="text-emerald-400/80 text-sm font-medium mb-1 uppercase tracking-wider">Total líquido do 13º</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
              {formatarMoeda(resultado.totalLiquido)}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span>Bruto: {formatarMoeda(resultado.valorTotal)}</span>
              <span className="text-white/10">|</span>
              <span>Descontos: {formatarMoeda(resultado.totalDescontos)}</span>
            </div>
            {resultado.meses < 12 && (
              <div className="mt-2 text-xs text-gray-500">
                Proporcional: {resultado.meses}/12 meses
              </div>
            )}
          </div>

          {/* Parcelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1ª Parcela */}
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-sm">1ª</div>
                <div>
                  <h3 className="text-white font-bold text-sm">1ª Parcela</h3>
                  <p className="text-gray-500 text-xs">Até 30 de novembro</p>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-emerald-400">{formatarMoeda(resultado.primeiraParcela)}</p>
              <p className="text-gray-500 text-xs mt-1">Sem descontos</p>
            </div>

            {/* 2ª Parcela */}
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center text-amber-400 font-bold text-sm">2ª</div>
                <div>
                  <h3 className="text-white font-bold text-sm">2ª Parcela</h3>
                  <p className="text-gray-500 text-xs">Até 20 de dezembro</p>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-amber-400">{formatarMoeda(resultado.segundaParcela)}</p>
              <p className="text-gray-500 text-xs mt-1">Com descontos de INSS e IR</p>
            </div>
          </div>

          {/* Detalhamento */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold">Detalhamento da 2ª parcela</h3>
            </div>
            <div className="divide-y divide-white/5">
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-gray-300 text-sm">13º bruto total ({resultado.meses}/12)</span>
                <span className="text-white font-semibold text-sm tabular-nums">{formatarMoeda(resultado.valorTotal)}</span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-gray-300 text-sm">1ª parcela já paga</span>
                <span className="text-gray-400 font-semibold text-sm tabular-nums">- {formatarMoeda(resultado.primeiraParcela)}</span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-gray-300 text-sm">INSS</span>
                <span className="text-rose-400 font-semibold text-sm tabular-nums">- {formatarMoeda(resultado.inss)}</span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-gray-300 text-sm">IRRF</span>
                  {resultado.irrf === 0 && <span className="text-gray-600 text-xs ml-2">(isento)</span>}
                </div>
                <span className={`font-semibold text-sm tabular-nums ${resultado.irrf === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {resultado.irrf === 0 ? 'R$ 0,00' : `- ${formatarMoeda(resultado.irrf)}`}
                </span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between bg-amber-500/5">
                <span className="text-white font-bold text-sm">2ª parcela líquida</span>
                <span className="text-amber-400 font-bold tabular-nums">{formatarMoeda(resultado.segundaParcela)}</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl px-6 py-4">
            <p className="text-blue-400 text-sm">
              ℹ️ A <strong>1ª parcela</strong> é paga sem nenhum desconto. Na <strong>2ª parcela</strong>, o INSS e o IRRF incidem sobre o valor total do 13º, e a 1ª parcela já paga é descontada.
            </p>
          </div>

          {/* Premium CTA */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">⭐</div>
            <h3 className="text-white font-bold text-lg mb-1">Quer o resultado completo?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Exporte em PDF profissional e veja a simulação com diferentes cenários de meses trabalhados.
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
