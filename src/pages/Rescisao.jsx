import { useState } from 'react'
import { Link } from 'react-router-dom'
import { calcularRescisao } from '../utils/rescisao'
import { formatarMoeda, ANO, TABELAS } from '../utils/calculos'

const TIPOS_RESCISAO = [
  { value: 'sem_justa_causa', label: 'Demissão sem justa causa', desc: 'A empresa demitiu o trabalhador' },
  { value: 'pedido_demissao', label: 'Pedido de demissão', desc: 'O trabalhador pediu para sair' },
  { value: 'acordo_mutuo', label: 'Acordo mútuo (art. 484-A)', desc: 'Empresa e trabalhador concordam' },
  { value: 'justa_causa', label: 'Justa causa', desc: 'Demissão por falta grave' },
]

export default function Rescisao() {
  const [form, setForm] = useState({
    salarioBruto: '',
    dataAdmissao: '',
    dataDemissao: '',
    tipoRescisao: 'sem_justa_causa',
    diasTrabalhados: '',
    avisoPrevioTrabalhado: false,
    feriasVencidas: false,
    dependentes: '0',
    saldoFGTS: '',
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

    // Validações
    if (!form.salarioBruto || parseFloat(form.salarioBruto) <= 0) {
      setErro('Informe o salário bruto.')
      return
    }
    if (!form.dataAdmissao || !form.dataDemissao) {
      setErro('Informe as datas de admissão e demissão.')
      return
    }
    if (new Date(form.dataDemissao) <= new Date(form.dataAdmissao)) {
      setErro('A data de demissão deve ser posterior à de admissão.')
      return
    }
    if (!form.diasTrabalhados || parseInt(form.diasTrabalhados) < 0 || parseInt(form.diasTrabalhados) > 31) {
      setErro('Informe os dias trabalhados no último mês (0 a 31).')
      return
    }

    const res = calcularRescisao({
      salarioBruto: parseFloat(form.salarioBruto),
      dataAdmissao: form.dataAdmissao,
      dataDemissao: form.dataDemissao,
      tipoRescisao: form.tipoRescisao,
      diasTrabalhados: parseInt(form.diasTrabalhados),
      avisoPrevioTrabalhado: form.avisoPrevioTrabalhado,
      feriasVencidas: form.feriasVencidas,
      dependentes: parseInt(form.dependentes) || 0,
      saldoFGTS: parseFloat(form.saldoFGTS) || 0,
    })

    setResultado(res)

    // Scroll to results
    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function handleLimpar() {
    setForm({
      salarioBruto: '',
      dataAdmissao: '',
      dataDemissao: '',
      tipoRescisao: 'sem_justa_causa',
      diasTrabalhados: '',
      avisoPrevioTrabalhado: false,
      feriasVencidas: false,
      dependentes: '0',
      saldoFGTS: '',
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
          <span className="text-gray-400">Rescisão Trabalhista</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Calculadora de Rescisão Trabalhista
        </h1>
        <p className="text-gray-400 text-lg">
          Calcule todas as verbas rescisórias com as tabelas <strong className="text-emerald-400">{ANO}</strong> atualizadas.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleCalcular} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Tipo de Rescisão */}
          <div className="sm:col-span-2">
            <label className="block text-white text-sm font-semibold mb-2">Tipo de Rescisão</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TIPOS_RESCISAO.map(tipo => (
                <label
                  key={tipo.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    form.tipoRescisao === tipo.value
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoRescisao"
                    value={tipo.value}
                    checked={form.tipoRescisao === tipo.value}
                    onChange={handleChange}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div>
                    <div className={`text-sm font-medium ${form.tipoRescisao === tipo.value ? 'text-emerald-400' : 'text-white'}`}>
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

          {/* Dias trabalhados último mês */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Dias trabalhados no último mês</label>
            <input
              type="number"
              name="diasTrabalhados"
              value={form.diasTrabalhados}
              onChange={handleChange}
              placeholder="Ex: 15"
              min="0"
              max="31"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          {/* Data Admissão */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Data de Admissão</label>
            <input
              type="date"
              name="dataAdmissao"
              value={form.dataAdmissao}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Data Demissão */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Data de Demissão</label>
            <input
              type="date"
              name="dataDemissao"
              value={form.dataDemissao}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all [color-scheme:dark]"
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

          {/* Saldo FGTS */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Saldo do FGTS (R$)
              <span className="text-gray-500 font-normal ml-1">(opcional)</span>
            </label>
            <input
              type="number"
              name="saldoFGTS"
              value={form.saldoFGTS}
              onChange={handleChange}
              placeholder="Ex: 15000.00"
              step="0.01"
              min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          {/* Checkboxes */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4">
            {(form.tipoRescisao === 'sem_justa_causa' || form.tipoRescisao === 'acordo_mutuo') && (
              <label className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 cursor-pointer hover:border-white/10 transition-all">
                <input
                  type="checkbox"
                  name="avisoPrevioTrabalhado"
                  checked={form.avisoPrevioTrabalhado}
                  onChange={handleChange}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span className="text-gray-300 text-sm">Aviso prévio trabalhado</span>
              </label>
            )}
            <label className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 cursor-pointer hover:border-white/10 transition-all">
              <input
                type="checkbox"
                name="feriasVencidas"
                checked={form.feriasVencidas}
                onChange={handleChange}
                className="accent-emerald-500 w-4 h-4"
              />
              <span className="text-gray-300 text-sm">Tenho férias vencidas</span>
            </label>
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
            Calcular Rescisão
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
            <p className="text-emerald-400/80 text-sm font-medium mb-1 uppercase tracking-wider">Total líquido da rescisão</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
              {formatarMoeda(resultado.totalLiquido)}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span>Bruto: {formatarMoeda(resultado.totalBruto)}</span>
              <span className="text-white/10">|</span>
              <span>Descontos: {formatarMoeda(resultado.totalDescontos)}</span>
            </div>
          </div>

          {/* Verbas */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold">Verbas Rescisórias</h3>
            </div>
            <div className="divide-y divide-white/5">
              {resultado.verbas.map((verba, i) => (
                <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-gray-300 text-sm">{verba.nome}</span>
                    <span className="text-gray-600 text-xs ml-2">({verba.detalhe})</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-sm tabular-nums">
                    {formatarMoeda(verba.valor)}
                  </span>
                </div>
              ))}
              <div className="px-6 py-3.5 flex items-center justify-between bg-white/[0.02]">
                <span className="text-white font-bold text-sm">Total Bruto</span>
                <span className="text-white font-bold tabular-nums">{formatarMoeda(resultado.totalBruto)}</span>
              </div>
            </div>
          </div>

          {/* Descontos */}
          {resultado.descontos.length > 0 && (
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="text-white font-bold">Descontos</h3>
              </div>
              <div className="divide-y divide-white/5">
                {resultado.descontos.map((desc, i) => (
                  <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-gray-300 text-sm">{desc.nome}</span>
                      <span className="text-gray-600 text-xs ml-2">({desc.detalhe})</span>
                    </div>
                    <span className="text-rose-400 font-semibold text-sm tabular-nums">
                      - {formatarMoeda(desc.valor)}
                    </span>
                  </div>
                ))}
                <div className="px-6 py-3.5 flex items-center justify-between bg-white/[0.02]">
                  <span className="text-white font-bold text-sm">Total Descontos</span>
                  <span className="text-rose-400 font-bold tabular-nums">- {formatarMoeda(resultado.totalDescontos)}</span>
                </div>
              </div>
            </div>
          )}

          {resultado.descontos.length === 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-6 py-4">
              <p className="text-emerald-400 text-sm text-center">
                🎉 Sem descontos de IRRF! Benefício da isenção {ANO} para rendas até {formatarMoeda(TABELAS.redutorIR.isencaoAte)}.
              </p>
            </div>
          )}

          {/* FGTS */}
          {resultado.fgts && (
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="text-white font-bold">FGTS</h3>
              </div>
              <div className="divide-y divide-white/5">
                <div className="px-6 py-3.5 flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Saldo informado</span>
                  <span className="text-gray-300 font-semibold text-sm tabular-nums">{formatarMoeda(resultado.fgts.saldo)}</span>
                </div>
                <div className="px-6 py-3.5 flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Multa rescisória ({resultado.fgts.multaPercentual})</span>
                  <span className="text-emerald-400 font-semibold text-sm tabular-nums">{formatarMoeda(resultado.fgts.multa)}</span>
                </div>
                {resultado.fgts.podeSacar ? (
                  <div className="px-6 py-3.5 flex items-center justify-between bg-emerald-500/5">
                    <span className="text-white font-bold text-sm">
                      Total a receber (FGTS + Multa)
                      {resultado.fgts.saquePercentual && <span className="text-gray-500 font-normal ml-1">({resultado.fgts.saquePercentual})</span>}
                    </span>
                    <span className="text-emerald-400 font-bold tabular-nums">{formatarMoeda(resultado.fgts.totalFGTS)}</span>
                  </div>
                ) : (
                  <div className="px-6 py-3.5 bg-amber-500/5">
                    <p className="text-amber-400 text-sm">
                      ⚠️ Neste tipo de rescisão, não há direito ao saque do FGTS nem à multa rescisória.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seguro-Desemprego */}
          {resultado.seguroDesemprego && (
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl px-6 py-4">
              <p className="text-blue-400 text-sm">
                ✅ Você pode ter direito ao <strong>Seguro-Desemprego</strong>.{' '}
                <Link to="/seguro-desemprego" className="underline hover:text-blue-300">
                  Clique aqui para calcular o valor das parcelas.
                </Link>
              </p>
            </div>
          )}

          {/* Premium CTA */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">⭐</div>
            <h3 className="text-white font-bold text-lg mb-1">Quer o resultado completo?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Exporte em PDF profissional, compare cenários (demissão vs. acordo) e veja o FGTS acumulado detalhado.
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
