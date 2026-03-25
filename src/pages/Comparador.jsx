import { useState } from 'react'
import { Link } from 'react-router-dom'
import { calcularRescisao } from '../utils/rescisao'
import { formatarMoeda, ANO, TABELAS } from '../utils/calculos'

export default function Comparador() {
  const [form, setForm] = useState({
    salarioBruto: '',
    dataAdmissao: '',
    dataDemissao: '',
    diasTrabalhados: '',
    avisoPrevioTrabalhado: false,
    feriasVencidas: false,
    dependentes: '0',
    saldoFGTS: '',
  })
  const [resultados, setResultados] = useState(null)
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
    setResultados(null)

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

    const base = {
      salarioBruto: parseFloat(form.salarioBruto),
      dataAdmissao: form.dataAdmissao,
      dataDemissao: form.dataDemissao,
      diasTrabalhados: parseInt(form.diasTrabalhados),
      avisoPrevioTrabalhado: form.avisoPrevioTrabalhado,
      feriasVencidas: form.feriasVencidas,
      dependentes: parseInt(form.dependentes) || 0,
      saldoFGTS: parseFloat(form.saldoFGTS) || 0,
    }

    const semJustaCausa = calcularRescisao({ ...base, tipoRescisao: 'sem_justa_causa' })
    const acordoMutuo = calcularRescisao({ ...base, tipoRescisao: 'acordo_mutuo' })

    // Total geral com FGTS
    const totalGeralSJC = semJustaCausa.totalLiquido + (semJustaCausa.fgts?.totalFGTS || 0)
    const totalGeralAM = acordoMutuo.totalLiquido + (acordoMutuo.fgts?.totalFGTS || 0)

    setResultados({
      semJustaCausa,
      acordoMutuo,
      totalGeralSJC,
      totalGeralAM,
      diferencaLiquido: semJustaCausa.totalLiquido - acordoMutuo.totalLiquido,
      diferencaTotal: totalGeralSJC - totalGeralAM,
    })

    setTimeout(() => {
      document.getElementById('comparacao')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function handleLimpar() {
    setForm({
      salarioBruto: '', dataAdmissao: '', dataDemissao: '',
      diasTrabalhados: '', avisoPrevioTrabalhado: false,
      feriasVencidas: false, dependentes: '0', saldoFGTS: '',
    })
    setResultados(null)
    setErro('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-emerald-400 transition-colors">Início</Link>
          <span>/</span>
          <Link to="/rescisao" className="hover:text-emerald-400 transition-colors">Rescisão</Link>
          <span>/</span>
          <span className="text-gray-400">Comparador de Cenários</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Demissão vs. Acordo Mútuo
        </h1>
        <p className="text-gray-400 text-lg">
          Compare os dois cenários lado a lado e descubra qual vale mais a pena — tabelas <strong className="text-emerald-400">{ANO}</strong>.
        </p>
      </div>

      {/* Alerta explicativo */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
        <span className="text-xl mt-0.5">⚖️</span>
        <div>
          <p className="text-amber-400 text-sm font-semibold">O que muda no acordo mútuo (art. 484-A)?</p>
          <ul className="text-gray-400 text-sm mt-1 space-y-0.5 list-none">
            <li>• Aviso prévio indenizado reduzido a <strong className="text-white">50%</strong></li>
            <li>• Multa do FGTS reduzida de 40% para <strong className="text-white">20%</strong></li>
            <li>• Saque do FGTS limitado a <strong className="text-white">80%</strong> do saldo</li>
            <li>• <strong className="text-rose-400">Sem direito</strong> ao seguro-desemprego</li>
          </ul>
        </div>
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

          {/* Dias trabalhados */}
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

          {/* Data admissão */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Data de admissão</label>
            <input
              type="date"
              name="dataAdmissao"
              value={form.dataAdmissao}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          {/* Data demissão */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Data de demissão</label>
            <input
              type="date"
              name="dataDemissao"
              value={form.dataDemissao}
              onChange={handleChange}
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
              placeholder="Consulte no app FGTS"
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

          {/* Checkboxes */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 cursor-pointer hover:border-white/10 transition-all">
              <input
                type="checkbox"
                name="avisoPrevioTrabalhado"
                checked={form.avisoPrevioTrabalhado}
                onChange={handleChange}
                className="accent-emerald-500 w-4 h-4"
              />
              <div>
                <span className="text-gray-300 text-sm">Aviso prévio trabalhado</span>
                <p className="text-gray-600 text-xs">Funcionário cumpriu o aviso</p>
              </div>
            </label>
            <label className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 cursor-pointer hover:border-white/10 transition-all">
              <input
                type="checkbox"
                name="feriasVencidas"
                checked={form.feriasVencidas}
                onChange={handleChange}
                className="accent-emerald-500 w-4 h-4"
              />
              <div>
                <span className="text-gray-300 text-sm">Tem férias vencidas</span>
                <p className="text-gray-600 text-xs">Período aquisitivo completo não gozado</p>
              </div>
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
            Comparar Cenários
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

      {/* Resultados */}
      {resultados && (
        <div id="comparacao" className="space-y-6">

          {/* Veredicto */}
          <div className={`rounded-2xl p-6 text-center border ${
            resultados.diferencaTotal >= 0
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-blue-500/5 border-blue-500/20'
          }`}>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">
              {resultados.diferencaTotal >= 0 ? '✅ Demissão sem justa causa é melhor' : '✅ Acordo mútuo é melhor'}
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
              {formatarMoeda(Math.abs(resultados.diferencaTotal))} a mais
            </p>
            <p className="text-gray-500 text-sm">diferença no total (verbas + FGTS)</p>
          </div>

          {/* Cards lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Demissão sem justa causa */}
            <div className="bg-[#1a1a2e] border border-emerald-500/20 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 bg-emerald-500/5 border-b border-emerald-500/10">
                <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wide">Demissão sem justa causa</h3>
              </div>
              <div className="divide-y divide-white/5">
                {resultados.semJustaCausa.verbas.map((v, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <span className="text-gray-300 text-xs">{v.nome}</span>
                      <span className="text-gray-600 text-[10px] ml-1">({v.detalhe})</span>
                    </div>
                    <span className="text-emerald-400 text-xs font-semibold tabular-nums">{formatarMoeda(v.valor)}</span>
                  </div>
                ))}
                {resultados.semJustaCausa.descontos.map((d, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <span className="text-gray-300 text-xs">{d.nome}</span>
                    <span className="text-rose-400 text-xs font-semibold tabular-nums">- {formatarMoeda(d.valor)}</span>
                  </div>
                ))}
                <div className="px-5 py-3 flex items-center justify-between bg-white/[0.02]">
                  <span className="text-white text-xs font-bold">Verbas líquidas</span>
                  <span className="text-white text-sm font-bold tabular-nums">{formatarMoeda(resultados.semJustaCausa.totalLiquido)}</span>
                </div>
                {resultados.semJustaCausa.fgts && (
                  <>
                    <div className="px-5 py-3 flex items-center justify-between">
                      <span className="text-gray-300 text-xs">FGTS + multa (40%)</span>
                      <span className="text-emerald-400 text-xs font-semibold tabular-nums">{formatarMoeda(resultados.semJustaCausa.fgts.totalFGTS)}</span>
                    </div>
                    <div className="px-5 py-4 flex items-center justify-between bg-emerald-500/5">
                      <span className="text-white text-xs font-bold">TOTAL GERAL</span>
                      <span className="text-emerald-400 text-base font-extrabold tabular-nums">{formatarMoeda(resultados.totalGeralSJC)}</span>
                    </div>
                  </>
                )}
                {!resultados.semJustaCausa.fgts && (
                  <div className="px-5 py-4 flex items-center justify-between bg-emerald-500/5">
                    <span className="text-white text-xs font-bold">TOTAL LÍQUIDO</span>
                    <span className="text-emerald-400 text-base font-extrabold tabular-nums">{formatarMoeda(resultados.semJustaCausa.totalLiquido)}</span>
                  </div>
                )}
                <div className="px-5 py-3 bg-emerald-500/5">
                  <p className="text-emerald-400 text-[10px]">✅ Direito ao seguro-desemprego</p>
                </div>
              </div>
            </div>

            {/* Acordo mútuo */}
            <div className="bg-[#1a1a2e] border border-blue-500/20 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 bg-blue-500/5 border-b border-blue-500/10">
                <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wide">Acordo mútuo (art. 484-A)</h3>
              </div>
              <div className="divide-y divide-white/5">
                {resultados.acordoMutuo.verbas.map((v, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <span className="text-gray-300 text-xs">{v.nome}</span>
                      <span className="text-gray-600 text-[10px] ml-1">({v.detalhe})</span>
                    </div>
                    <span className="text-blue-400 text-xs font-semibold tabular-nums">{formatarMoeda(v.valor)}</span>
                  </div>
                ))}
                {resultados.acordoMutuo.descontos.map((d, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <span className="text-gray-300 text-xs">{d.nome}</span>
                    <span className="text-rose-400 text-xs font-semibold tabular-nums">- {formatarMoeda(d.valor)}</span>
                  </div>
                ))}
                <div className="px-5 py-3 flex items-center justify-between bg-white/[0.02]">
                  <span className="text-white text-xs font-bold">Verbas líquidas</span>
                  <span className="text-white text-sm font-bold tabular-nums">{formatarMoeda(resultados.acordoMutuo.totalLiquido)}</span>
                </div>
                {resultados.acordoMutuo.fgts && (
                  <>
                    <div className="px-5 py-3 flex items-center justify-between">
                      <span className="text-gray-300 text-xs">FGTS (80%) + multa (20%)</span>
                      <span className="text-blue-400 text-xs font-semibold tabular-nums">{formatarMoeda(resultados.acordoMutuo.fgts.totalFGTS)}</span>
                    </div>
                    <div className="px-5 py-4 flex items-center justify-between bg-blue-500/5">
                      <span className="text-white text-xs font-bold">TOTAL GERAL</span>
                      <span className="text-blue-400 text-base font-extrabold tabular-nums">{formatarMoeda(resultados.totalGeralAM)}</span>
                    </div>
                  </>
                )}
                {!resultados.acordoMutuo.fgts && (
                  <div className="px-5 py-4 flex items-center justify-between bg-blue-500/5">
                    <span className="text-white text-xs font-bold">TOTAL LÍQUIDO</span>
                    <span className="text-blue-400 text-base font-extrabold tabular-nums">{formatarMoeda(resultados.acordoMutuo.totalLiquido)}</span>
                  </div>
                )}
                <div className="px-5 py-3 bg-rose-500/5">
                  <p className="text-rose-400 text-[10px]">❌ Sem direito ao seguro-desemprego</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela resumo */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold">Resumo comparativo</h3>
            </div>
            <div className="divide-y divide-white/5">
              <LinhaComparativa
                label="Verbas brutas"
                v1={resultados.semJustaCausa.totalBruto}
                v2={resultados.acordoMutuo.totalBruto}
              />
              <LinhaComparativa
                label="Descontos (INSS + IR)"
                v1={resultados.semJustaCausa.totalDescontos}
                v2={resultados.acordoMutuo.totalDescontos}
                inverso
              />
              <LinhaComparativa
                label="Verbas líquidas"
                v1={resultados.semJustaCausa.totalLiquido}
                v2={resultados.acordoMutuo.totalLiquido}
              />
              {(resultados.semJustaCausa.fgts || resultados.acordoMutuo.fgts) && (
                <LinhaComparativa
                  label="FGTS + Multa"
                  v1={resultados.semJustaCausa.fgts?.totalFGTS || 0}
                  v2={resultados.acordoMutuo.fgts?.totalFGTS || 0}
                />
              )}
              <LinhaComparativa
                label="TOTAL GERAL"
                v1={resultados.totalGeralSJC}
                v2={resultados.totalGeralAM}
                destaque
              />
            </div>
          </div>

          {/* Aviso seguro-desemprego */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-6 py-4">
            <p className="text-amber-400 text-sm">
              ⚠️ <strong>Atenção:</strong> No acordo mútuo, o trabalhador <strong>não tem direito ao seguro-desemprego</strong>. Se precisar do benefício, isso deve pesar na decisão — mesmo que o valor imediato seja semelhante.
            </p>
          </div>

          {/* CTA Premium */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">⭐</div>
            <h3 className="text-white font-bold text-lg mb-1">Quer salvar este comparativo?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Exporte em PDF profissional e acesse o histórico de simulações no plano Premium.
            </p>
            <Link
              to="/premium"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm"
            >
              Conhecer o Premium
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

        </div>
      )}
    </div>
  )
}

// Sub-componente: linha da tabela comparativa
function LinhaComparativa({ label, v1, v2, inverso = false, destaque = false }) {
  const melhor = inverso ? v1 < v2 : v1 > v2
  const pior = inverso ? v1 > v2 : v1 < v2

  return (
    <div className={`px-6 py-3.5 grid grid-cols-3 items-center ${destaque ? 'bg-white/[0.03]' : ''}`}>
      <span className={`text-sm ${destaque ? 'text-white font-bold' : 'text-gray-400'}`}>{label}</span>
      <span className={`text-center text-sm font-semibold tabular-nums ${
        destaque ? 'text-emerald-400 font-extrabold' : melhor ? 'text-emerald-400' : pior ? 'text-gray-300' : 'text-gray-300'
      }`}>
        {formatarMoeda(v1)}
        {melhor && !destaque && <span className="ml-1 text-[10px] text-emerald-500">▲</span>}
      </span>
      <span className={`text-center text-sm font-semibold tabular-nums ${
        destaque ? 'text-blue-400 font-extrabold' : !melhor && !pior ? 'text-gray-300' : pior ? 'text-gray-300' : 'text-blue-400'
      }`}>
        {formatarMoeda(v2)}
        {!melhor && v1 !== v2 && !destaque && <span className="ml-1 text-[10px] text-blue-500">▲</span>}
      </span>
    </div>
  )
}
