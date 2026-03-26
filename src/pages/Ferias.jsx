import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePremium } from '../context/PremiumContext'
import { ANO, calcularINSS, calcularIRRF, formatarMoeda } from '../utils/calculos'
import { exportarFeriasPDF } from '../utils/exportarPDF'

export default function Ferias() {
  const [form, setForm] = useState({
    salarioBruto: '',
    tipoFerias: 'integrais',
    avosFerias: '12',
    abonoPecuniario: false,
    dependentes: '0',
  })
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const { isPremium, sessao } = usePremium()

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

    const avos = parseInt(form.avosFerias)
    if (form.tipoFerias === 'proporcionais' && (avos < 1 || avos > 12)) {
      setErro('Informe os avos entre 1 e 12.')
      return
    }

    const dependentes = parseInt(form.dependentes) || 0
    const diasFerias = form.tipoFerias === 'integrais' ? 30 : Math.round((30 / 12) * avos)
    const diasGozados = form.abonoPecuniario ? diasFerias - 10 : diasFerias
    const diasVendidos = form.abonoPecuniario ? 10 : 0

    const valorBase = form.tipoFerias === 'integrais'
      ? bruto
      : (bruto / 12) * avos

    const tercoConstitucional = valorBase / 3

    let valorAbono = 0
    let tercoAbono = 0
    if (form.abonoPecuniario) {
      valorAbono = (bruto / 30) * 10
      tercoAbono = valorAbono / 3
    }

    const totalBruto = valorBase + tercoConstitucional + valorAbono + tercoAbono
    const baseDesconto = valorBase + tercoConstitucional
    const inss = calcularINSS(baseDesconto)
    const baseIR = baseDesconto - inss
    const irrf = calcularIRRF(baseIR, dependentes)
    const totalDescontos = inss + irrf
    const totalLiquido = totalBruto - totalDescontos

    setResultado({
      valorBase: Math.round(valorBase * 100) / 100,
      tercoConstitucional: Math.round(tercoConstitucional * 100) / 100,
      valorAbono: Math.round(valorAbono * 100) / 100,
      tercoAbono: Math.round(tercoAbono * 100) / 100,
      totalBruto: Math.round(totalBruto * 100) / 100,
      inss: Math.round(inss * 100) / 100,
      irrf: Math.round(irrf * 100) / 100,
      totalDescontos: Math.round(totalDescontos * 100) / 100,
      totalLiquido: Math.round(totalLiquido * 100) / 100,
      diasGozados,
      diasVendidos,
      avos: form.tipoFerias === 'integrais' ? 12 : avos,
      tipoFerias: form.tipoFerias,
      abono: form.abonoPecuniario,
      baseIR: Math.round(baseIR * 100) / 100,
    })

    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function handleLimpar() {
    setForm({ salarioBruto: '', tipoFerias: 'integrais', avosFerias: '12', abonoPecuniario: false, dependentes: '0' })
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
          <span className="text-gray-400">Férias</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Calculadora de Férias
        </h1>
        <p className="text-gray-400 text-lg">
          Calcule férias integrais, proporcionais e abono pecuniário com tabelas <strong className="text-emerald-400">{ANO}</strong>.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleCalcular} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Tipo de Férias */}
          <div className="sm:col-span-2">
            <label className="block text-white text-sm font-semibold mb-2">Tipo de Férias</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { value: 'integrais', label: 'Férias integrais', desc: '30 dias — período aquisitivo completo' },
                { value: 'proporcionais', label: 'Férias proporcionais', desc: 'Período aquisitivo incompleto' },
              ].map(tipo => (
                <label
                  key={tipo.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.tipoFerias === tipo.value
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                    }`}
                >
                  <input
                    type="radio"
                    name="tipoFerias"
                    value={tipo.value}
                    checked={form.tipoFerias === tipo.value}
                    onChange={handleChange}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div>
                    <div className={`text-sm font-medium ${form.tipoFerias === tipo.value ? 'text-emerald-400' : 'text-white'}`}>
                      {tipo.label}
                    </div>
                    <div className="text-xs text-gray-500">{tipo.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

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

          {/* Avos */}
          {form.tipoFerias === 'proporcionais' && (
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Avos de férias (meses)</label>
              <select
                name="avosFerias"
                value={form.avosFerias}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                  <option key={n} value={n} className="bg-[#1a1a2e]">{n}/12 avos</option>
                ))}
              </select>
            </div>
          )}

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

          {/* Abono pecuniário */}
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 cursor-pointer hover:border-white/10 transition-all">
              <input
                type="checkbox"
                name="abonoPecuniario"
                checked={form.abonoPecuniario}
                onChange={handleChange}
                className="accent-emerald-500 w-4 h-4"
              />
              <div>
                <span className="text-gray-300 text-sm">Vender 10 dias (abono pecuniário)</span>
                <p className="text-gray-600 text-xs">O trabalhador pode converter 1/3 das férias em dinheiro</p>
              </div>
            </label>
          </div>
        </div>

        {erro && (
          <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            <p className="text-rose-400 text-sm">{erro}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200 text-base"
          >
            Calcular Férias
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
            <p className="text-emerald-400/80 text-sm font-medium mb-1 uppercase tracking-wider">Total líquido das férias</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
              {formatarMoeda(resultado.totalLiquido)}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span>Bruto: {formatarMoeda(resultado.totalBruto)}</span>
              <span className="text-white/10">|</span>
              <span>Descontos: {formatarMoeda(resultado.totalDescontos)}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {resultado.tipoFerias === 'integrais' ? 'Férias integrais' : `${resultado.avos}/12 avos`}
              {resultado.abono && ' + abono pecuniário (10 dias)'}
            </div>
          </div>

          {/* Verbas */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold">Detalhamento</h3>
            </div>
            <div className="divide-y divide-white/5">
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-gray-300 text-sm">Férias {resultado.tipoFerias === 'integrais' ? '(30 dias)' : `proporcionais (${resultado.avos}/12)`}</span>
                <span className="text-emerald-400 font-semibold text-sm tabular-nums">{formatarMoeda(resultado.valorBase)}</span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-gray-300 text-sm">1/3 constitucional</span>
                <span className="text-emerald-400 font-semibold text-sm tabular-nums">{formatarMoeda(resultado.tercoConstitucional)}</span>
              </div>
              {resultado.abono && (
                <>
                  <div className="px-6 py-3.5 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Abono pecuniário (10 dias)</span>
                    <span className="text-emerald-400 font-semibold text-sm tabular-nums">{formatarMoeda(resultado.valorAbono)}</span>
                  </div>
                  <div className="px-6 py-3.5 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">1/3 sobre abono</span>
                    <span className="text-emerald-400 font-semibold text-sm tabular-nums">{formatarMoeda(resultado.tercoAbono)}</span>
                  </div>
                </>
              )}
              <div className="px-6 py-3.5 flex items-center justify-between bg-white/[0.02]">
                <span className="text-white font-bold text-sm">Total bruto</span>
                <span className="text-white font-bold tabular-nums">{formatarMoeda(resultado.totalBruto)}</span>
              </div>
            </div>
          </div>

          {/* Descontos */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold">Descontos</h3>
            </div>
            <div className="divide-y divide-white/5">
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
              <div className="px-6 py-3.5 flex items-center justify-between bg-white/[0.02]">
                <span className="text-white font-bold text-sm">Total descontos</span>
                <span className="text-rose-400 font-bold tabular-nums">- {formatarMoeda(resultado.totalDescontos)}</span>
              </div>
            </div>
          </div>

          {resultado.abono && (
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl px-6 py-4">
              <p className="text-blue-400 text-sm">
                ℹ️ O abono pecuniário e seu 1/3 são <strong>isentos de INSS e IR</strong>. Os descontos incidem apenas sobre as férias gozadas + 1/3.
              </p>
            </div>
          )}

          {/* Exportar PDF + Premium CTA */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">📄</div>
            <h3 className="text-white font-bold text-lg mb-1">Exportar Resultado em PDF</h3>
            <p className="text-gray-400 text-sm mb-4">
              Baixe um relatório profissional com todos os detalhes das suas férias.
            </p>
            <button
              type="button"
              onClick={() => exportarFeriasPDF(form, resultado, isPremium, sessao?.email)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
              {isPremium ? 'Baixar PDF Premium' : 'Baixar PDF Grátis'}
            </button>
            {!isPremium && (
              <div className="border-t border-white/10 pt-4 mt-2">
                <p className="text-gray-500 text-xs mb-3">
                  ⭐ Quer ainda mais? Compare cenários, exporte Excel e acesse o histórico completo.
                </p>
                <Link
                  to="/premium"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium text-sm transition-colors"
                >
                  Conhecer o Premium
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}