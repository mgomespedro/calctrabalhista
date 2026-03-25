import { useState } from 'react'
import { Link } from 'react-router-dom'
import { calcularINSS, calcularIRRF, formatarMoeda, SALARIO_MINIMO, ANO, TABELAS } from '../utils/calculos'

export default function SalarioLiquido() {
  const [form, setForm] = useState({
    salarioBruto: '',
    dependentes: '0',
    outrasDeducoes: '0',
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

    const dependentes = parseInt(form.dependentes) || 0
    const outrasDeducoes = parseFloat(form.outrasDeducoes) || 0

    // 1. INSS
    const inss = calcularINSS(bruto)

    // 2. Base de cálculo do IR = bruto - INSS - dependentes - outras deduções
    const baseIR = bruto - inss
    const irrf = calcularIRRF(baseIR, dependentes)

    // 3. Total descontos
    const totalDescontos = inss + irrf + outrasDeducoes

    // 4. Salário líquido
    const liquido = bruto - totalDescontos

    // 5. Alíquota efetiva
    const aliquotaEfetivaINSS = bruto > 0 ? (inss / bruto) * 100 : 0
    const aliquotaEfetivaIR = bruto > 0 ? (irrf / bruto) * 100 : 0
    const aliquotaEfetivaTotal = bruto > 0 ? (totalDescontos / bruto) * 100 : 0

    // 6. Verificar se beneficia da isenção 2026
    const baseCalculoIR = baseIR - (dependentes * 189.59)
    const beneficioIsencao = baseCalculoIR <= 5000
    const beneficioReducao = baseCalculoIR > 5000 && baseCalculoIR <= 7350

    setResultado({
      bruto,
      inss,
      irrf,
      outrasDeducoes,
      totalDescontos,
      liquido,
      aliquotaEfetivaINSS: Math.round(aliquotaEfetivaINSS * 100) / 100,
      aliquotaEfetivaIR: Math.round(aliquotaEfetivaIR * 100) / 100,
      aliquotaEfetivaTotal: Math.round(aliquotaEfetivaTotal * 100) / 100,
      beneficioIsencao,
      beneficioReducao,
      baseCalculoIR: Math.round(baseCalculoIR * 100) / 100,
      dependentes,
    })

    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function handleLimpar() {
    setForm({ salarioBruto: '', dependentes: '0', outrasDeducoes: '0' })
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
          <span className="text-gray-400">Salário Líquido</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Calculadora de Salário Líquido
        </h1>
        <p className="text-gray-400 text-lg">
          Descubra quanto sobra no bolso com a nova isenção de IR <strong className="text-emerald-400">{ANO}</strong>.
        </p>
      </div>

      {/* Highlight */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
        <span className="text-xl mt-0.5">🎉</span>
        <div>
          <p className="text-emerald-400 text-sm font-semibold">Novidade {ANO} — Isenção de IR ampliada!</p>
          <p className="text-gray-400 text-sm mt-0.5">
            Quem ganha até {formatarMoeda(TABELAS.redutorIR.isencaoAte)}/mês está isento de Imposto de Renda. Rendas até {formatarMoeda(TABELAS.redutorIR.reducaoAte)} têm redução parcial.
          </p>
        </div>
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

          {/* Outras deduções */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Outros descontos (R$)
              <span className="text-gray-500 font-normal ml-1">(opcional)</span>
            </label>
            <input
              type="number"
              name="outrasDeducoes"
              value={form.outrasDeducoes}
              onChange={handleChange}
              placeholder="Ex: 200.00"
              step="0.01"
              min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
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
            Calcular Salário Líquido
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
            <p className="text-emerald-400/80 text-sm font-medium mb-1 uppercase tracking-wider">Seu salário líquido</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
              {formatarMoeda(resultado.liquido)}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span>Bruto: {formatarMoeda(resultado.bruto)}</span>
              <span className="text-white/10">|</span>
              <span>Descontos: {formatarMoeda(resultado.totalDescontos)}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Alíquota efetiva total: {resultado.aliquotaEfetivaTotal}%
            </div>
          </div>

          {/* Isenção info */}
          {resultado.beneficioIsencao && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-6 py-4">
              <p className="text-emerald-400 text-sm text-center">
                🎉 <strong>Você está isento de Imposto de Renda!</strong> Sua base de cálculo ({formatarMoeda(resultado.baseCalculoIR)}) está dentro da faixa de isenção de {formatarMoeda(TABELAS.redutorIR.isencaoAte)}.
              </p>
            </div>
          )}
          {resultado.beneficioReducao && (
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl px-6 py-4">
              <p className="text-blue-400 text-sm text-center">
                💙 Você tem <strong>redução parcial do IR</strong>! Sua base de cálculo ({formatarMoeda(resultado.baseCalculoIR)}) está na faixa de redução gradual ({formatarMoeda(TABELAS.redutorIR.isencaoAte)} a {formatarMoeda(TABELAS.redutorIR.reducaoAte)}).
              </p>
            </div>
          )}

          {/* Breakdown */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold">Detalhamento</h3>
            </div>
            <div className="divide-y divide-white/5">
              {/* Bruto */}
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-gray-300 text-sm">Salário bruto</span>
                <span className="text-white font-semibold text-sm tabular-nums">{formatarMoeda(resultado.bruto)}</span>
              </div>

              {/* INSS */}
              <div className="px-6 py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-gray-300 text-sm">INSS</span>
                  <span className="text-gray-600 text-xs ml-2">(alíquota efetiva: {resultado.aliquotaEfetivaINSS}%)</span>
                </div>
                <span className="text-rose-400 font-semibold text-sm tabular-nums">- {formatarMoeda(resultado.inss)}</span>
              </div>

              {/* IRRF */}
              <div className="px-6 py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-gray-300 text-sm">IRRF</span>
                  <span className="text-gray-600 text-xs ml-2">
                    {resultado.irrf === 0
                      ? '(isento)'
                      : `(alíquota efetiva: ${resultado.aliquotaEfetivaIR}%)`
                    }
                  </span>
                </div>
                <span className={`font-semibold text-sm tabular-nums ${resultado.irrf === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {resultado.irrf === 0 ? 'R$ 0,00' : `- ${formatarMoeda(resultado.irrf)}`}
                </span>
              </div>

              {/* Outras deduções */}
              {resultado.outrasDeducoes > 0 && (
                <div className="px-6 py-3.5 flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Outros descontos</span>
                  <span className="text-rose-400 font-semibold text-sm tabular-nums">- {formatarMoeda(resultado.outrasDeducoes)}</span>
                </div>
              )}

              {/* Total */}
              <div className="px-6 py-4 flex items-center justify-between bg-emerald-500/5">
                <span className="text-white font-bold">Salário líquido</span>
                <span className="text-emerald-400 font-bold text-lg tabular-nums">{formatarMoeda(resultado.liquido)}</span>
              </div>
            </div>
          </div>

          {/* Tabela de referência rápida */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold">Referência rápida — Tabelas {ANO}</h3>
            </div>
            <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Salário Mínimo</p>
                <p className="text-white font-semibold text-sm">{formatarMoeda(TABELAS.salarioMinimo)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Teto INSS</p>
                <p className="text-white font-semibold text-sm">{formatarMoeda(TABELAS.tetoINSS)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Isenção IR</p>
                <p className="text-emerald-400 font-semibold text-sm">Até {formatarMoeda(TABELAS.redutorIR.isencaoAte)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Redução IR</p>
                <p className="text-blue-400 font-semibold text-sm">Até {formatarMoeda(TABELAS.redutorIR.reducaoAte)}</p>
              </div>
            </div>
          </div>

          {/* Premium CTA */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">⭐</div>
            <h3 className="text-white font-bold text-lg mb-1">Quer mais detalhes?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Exporte em PDF, veja a evolução anual do seu salário e compare cenários com diferentes faixas salariais.
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
