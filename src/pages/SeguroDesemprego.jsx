import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePremium } from '../context/PremiumContext'
import { ANO, formatarMoeda, TABELAS } from '../utils/calculos'
import { exportarSeguroDesempregoPDF } from '../utils/exportarPDF'

export default function SeguroDesemprego() {
  const [form, setForm] = useState({
    salario1: '',
    salario2: '',
    salario3: '',
    vezesRecebeu: '0',
    mesesTrabalhados: '',
  })
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const { isPremium, sessao } = usePremium()

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function calcularParcelas(vezes, meses) {
    const v = parseInt(vezes)
    if (v === 0) {
      if (meses < 12) return { temDireito: false, motivo: 'Na 1ª solicitação, é necessário ter trabalhado pelo menos 12 meses nos últimos 18 meses.' }
      if (meses >= 24) return { temDireito: true, parcelas: 5 }
      return { temDireito: true, parcelas: 4 }
    } else if (v === 1) {
      if (meses < 9) return { temDireito: false, motivo: 'Na 2ª solicitação, é necessário ter trabalhado pelo menos 9 meses nos últimos 12 meses.' }
      if (meses >= 24) return { temDireito: true, parcelas: 5 }
      if (meses >= 12) return { temDireito: true, parcelas: 4 }
      return { temDireito: true, parcelas: 3 }
    } else {
      if (meses < 6) return { temDireito: false, motivo: 'A partir da 3ª solicitação, é necessário ter trabalhado pelo menos 6 meses.' }
      if (meses >= 24) return { temDireito: true, parcelas: 5 }
      if (meses >= 12) return { temDireito: true, parcelas: 4 }
      return { temDireito: true, parcelas: 3 }
    }
  }

  function calcularValorParcela(mediaSalarial) {
    const faixas = TABELAS.seguroDesemprego.faixas
    const minimo = TABELAS.seguroDesemprego.minimoParcelaValor
    let valor = 0
    for (const faixa of faixas) {
      if (mediaSalarial >= faixa.min && mediaSalarial <= faixa.max) {
        if (faixa.tipo === 'percentual') {
          valor = mediaSalarial * faixa.percentual
        } else if (faixa.tipo === 'formula') {
          valor = (mediaSalarial - (faixa.min - 0.01)) * faixa.percentual + faixa.valorFixo
        } else if (faixa.tipo === 'fixo') {
          valor = faixa.valorFixo
        }
        break
      }
    }
    return Math.max(minimo, Math.round(valor * 100) / 100)
  }

  function handleCalcular(e) {
    e.preventDefault()
    setErro('')
    setResultado(null)

    const s1 = parseFloat(form.salario1)
    const s2 = parseFloat(form.salario2)
    const s3 = parseFloat(form.salario3)

    if (!s1 || s1 <= 0 || !s2 || s2 <= 0 || !s3 || s3 <= 0) {
      setErro('Informe os 3 últimos salários.')
      return
    }

    const meses = parseInt(form.mesesTrabalhados)
    if (!meses || meses < 1) {
      setErro('Informe os meses trabalhados.')
      return
    }

    const mediaSalarial = (s1 + s2 + s3) / 3
    const infoParcelas = calcularParcelas(form.vezesRecebeu, meses)

    if (!infoParcelas.temDireito) {
      setResultado({ temDireito: false, motivo: infoParcelas.motivo })
    } else {
      const valorParcela = calcularValorParcela(mediaSalarial)
      const totalEstimado = valorParcela * infoParcelas.parcelas
      setResultado({
        temDireito: true,
        mediaSalarial: Math.round(mediaSalarial * 100) / 100,
        valorParcela,
        parcelas: infoParcelas.parcelas,
        totalEstimado: Math.round(totalEstimado * 100) / 100,
        meses,
      })
    }

    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function handleLimpar() {
    setForm({ salario1: '', salario2: '', salario3: '', vezesRecebeu: '0', mesesTrabalhados: '' })
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
          <span className="text-gray-400">Seguro-Desemprego</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Calculadora de Seguro-Desemprego
        </h1>
        <p className="text-gray-400 text-lg">
          Descubra quantas parcelas e quanto vai receber — tabelas <strong className="text-emerald-400">{ANO}</strong>.
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
        <span className="text-xl mt-0.5">ℹ️</span>
        <div>
          <p className="text-blue-400 text-sm font-semibold">Quem tem direito?</p>
          <p className="text-gray-400 text-sm mt-0.5">
            O seguro-desemprego é pago ao trabalhador demitido <strong>sem justa causa</strong>. Não é devido em pedido de demissão, justa causa ou acordo mútuo (art. 484-A).
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleCalcular} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Último salário (R$)</label>
            <input type="number" name="salario1" value={form.salario1} onChange={handleChange}
              placeholder="Mês mais recente" step="0.01" min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Penúltimo salário (R$)</label>
            <input type="number" name="salario2" value={form.salario2} onChange={handleChange}
              placeholder="2º mês anterior" step="0.01" min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Antepenúltimo salário (R$)</label>
            <input type="number" name="salario3" value={form.salario3} onChange={handleChange}
              placeholder="3º mês anterior" step="0.01" min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Meses trabalhados</label>
            <input type="number" name="mesesTrabalhados" value={form.mesesTrabalhados} onChange={handleChange}
              placeholder="Nos últimos 18 meses" min="1" max="36"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-white text-sm font-semibold mb-2">Quantas vezes já recebeu seguro-desemprego?</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: '0', label: 'Nunca', desc: '1ª solicitação' },
                { value: '1', label: '1 vez', desc: '2ª solicitação' },
                { value: '2', label: '2+ vezes', desc: '3ª+ solicitação' },
              ].map(opt => (
                <label key={opt.value}
                  className={`flex flex-col items-center p-2.5 rounded-xl border cursor-pointer transition-all text-center ${form.vezesRecebeu === opt.value
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                    }`}
                >
                  <input type="radio" name="vezesRecebeu" value={opt.value}
                    checked={form.vezesRecebeu === opt.value} onChange={handleChange} className="sr-only"
                  />
                  <span className={`text-sm font-bold ${form.vezesRecebeu === opt.value ? 'text-emerald-400' : 'text-white'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-gray-500">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {erro && (
          <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            <p className="text-rose-400 text-sm">{erro}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200 text-base"
          >
            Calcular Seguro-Desemprego
          </button>
          <button type="button" onClick={handleLimpar}
            className="px-6 py-3.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
          >
            Limpar
          </button>
        </div>
      </form>

      {/* Results */}
      {resultado && (
        <div id="resultado" className="space-y-4">
          {!resultado.temDireito ? (
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 sm:p-8 text-center">
              <div className="text-4xl mb-3">😔</div>
              <h3 className="text-white font-bold text-xl mb-2">Sem direito ao seguro-desemprego</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">{resultado.motivo}</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 text-center">
                <p className="text-emerald-400/80 text-sm font-medium mb-1 uppercase tracking-wider">Valor de cada parcela</p>
                <p className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                  {formatarMoeda(resultado.valorParcela)}
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                  <span>{resultado.parcelas} parcelas</span>
                  <span className="text-white/10">|</span>
                  <span>Total estimado: {formatarMoeda(resultado.totalEstimado)}</span>
                </div>
              </div>

              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Suas parcelas</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i}
                      className={`rounded-xl p-3 text-center transition-all ${i < resultado.parcelas
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : 'bg-white/[0.02] border border-white/5 opacity-30'
                        }`}
                    >
                      <p className={`text-xs font-medium mb-1 ${i < resultado.parcelas ? 'text-emerald-400/70' : 'text-gray-600'}`}>
                        {i + 1}ª parcela
                      </p>
                      <p className={`text-sm font-bold ${i < resultado.parcelas ? 'text-emerald-400' : 'text-gray-700'}`}>
                        {i < resultado.parcelas ? formatarMoeda(resultado.valorParcela) : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-white font-bold">Detalhamento</h3>
                </div>
                <div className="divide-y divide-white/5">
                  <div className="px-6 py-3.5 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Média dos 3 últimos salários</span>
                    <span className="text-white font-semibold text-sm tabular-nums">{formatarMoeda(resultado.mediaSalarial)}</span>
                  </div>
                  <div className="px-6 py-3.5 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Valor de cada parcela</span>
                    <span className="text-emerald-400 font-semibold text-sm tabular-nums">{formatarMoeda(resultado.valorParcela)}</span>
                  </div>
                  <div className="px-6 py-3.5 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Número de parcelas</span>
                    <span className="text-emerald-400 font-semibold text-sm tabular-nums">{resultado.parcelas}</span>
                  </div>
                  <div className="px-6 py-3.5 flex items-center justify-between bg-emerald-500/5">
                    <span className="text-white font-bold">Total estimado</span>
                    <span className="text-emerald-400 font-bold text-lg tabular-nums">{formatarMoeda(resultado.totalEstimado)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl px-6 py-4">
                <p className="text-amber-400 text-sm">
                  ⚠️ O valor mínimo da parcela é de {formatarMoeda(TABELAS.seguroDesemprego.minimoParcelaValor)} (salário mínimo). O seguro-desemprego <strong>não tem descontos</strong> de INSS ou IR.
                </p>
              </div>
            </>
          )}

          {/* Exportar PDF + Premium CTA */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">📄</div>
            <h3 className="text-white font-bold text-lg mb-1">Exportar Resultado em PDF</h3>
            <p className="text-gray-400 text-sm mb-4">
              Baixe um relatório profissional com todos os detalhes do seu seguro-desemprego.
            </p>
            <button
              type="button"
              onClick={() => exportarSeguroDesempregoPDF(form, resultado, isPremium, sessao?.email)}
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