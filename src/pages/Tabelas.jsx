import { Link } from 'react-router-dom'
import { TABELAS, formatarMoeda, formatarPercentual } from '../utils/calculos'

function fmtValor(v) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Tabelas() {
  const T = TABELAS

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-emerald-400 transition-colors">Início</Link>
          <span>/</span>
          <span className="text-gray-400">Tabelas {T.ano}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Tabelas de Referência {T.ano}
        </h1>
        <p className="text-gray-400 text-lg">
          Todos os valores e alíquotas usados nas nossas calculadoras, com base nas fontes oficiais.
        </p>
        <p className="text-gray-600 text-sm mt-1">
          Última atualização: {new Date(T.atualizadoEm).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="space-y-6">

        {/* Valores Gerais */}
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <span className="text-xl">📌</span>
            <h2 className="text-white font-bold text-lg">Valores Gerais {T.ano}</h2>
          </div>
          <div className="divide-y divide-white/5">
            {[
              { label: 'Salário mínimo', valor: `R$ ${fmtValor(T.salarioMinimo)}`, nota: `A partir de janeiro/${T.ano}` },
              { label: 'Teto do INSS', valor: `R$ ${fmtValor(T.tetoINSS)}`, nota: `Desconto máximo: ~R$ ${fmtValor(T.descontoMaximoINSS)}` },
              { label: 'Isenção do IR', valor: `Até R$ ${fmtValor(T.redutorIR.isencaoAte)}`, nota: 'Lei nº 15.270/2025' },
              { label: 'Redução parcial do IR', valor: `R$ ${fmtValor(T.redutorIR.isencaoAte)} a R$ ${fmtValor(T.redutorIR.reducaoAte)}`, nota: 'Redução gradual decrescente' },
              { label: 'Dedução por dependente (IR)', valor: `R$ ${fmtValor(T.deducaoDependenteIR)}/mês`, nota: 'Por dependente' },
              { label: 'Salário-família', valor: `R$ ${fmtValor(T.salarioFamilia.valor)}`, nota: `Para remuneração até R$ ${fmtValor(T.salarioFamilia.limiteRemuneracao)}` },
              { label: 'FGTS mensal', valor: formatarPercentual(T.fgtsPercentual), nota: 'Depositado pelo empregador' },
              { label: 'Multa FGTS (sem justa causa)', valor: formatarPercentual(T.multaFGTSSemJustaCausa), nota: 'Pago na rescisão' },
              { label: 'Multa FGTS (acordo mútuo)', valor: formatarPercentual(T.multaFGTSAcordoMutuo), nota: 'Art. 484-A da CLT' },
              { label: 'Aviso prévio', valor: `${T.avisoPrevio.diasBase} dias + ${T.avisoPrevio.diasPorAno} por ano`, nota: `Máximo de ${T.avisoPrevio.maximo} dias` },
            ].map((item, i) => (
              <div key={i} className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <span className="text-gray-300 text-sm">{item.label}</span>
                  <span className="text-gray-600 text-xs ml-2">({item.nota})</span>
                </div>
                <span className="text-emerald-400 font-semibold text-sm tabular-nums">{item.valor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela INSS */}
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <span className="text-xl">🏛️</span>
            <div>
              <h2 className="text-white font-bold text-lg">Tabela INSS {T.ano}</h2>
              <p className="text-gray-500 text-xs">Cálculo progressivo — cada alíquota incide apenas sobre a parcela na faixa</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-gray-400 font-semibold text-xs uppercase tracking-wider">Faixa Salarial</th>
                  <th className="px-6 py-3 text-center text-gray-400 font-semibold text-xs uppercase tracking-wider">Alíquota</th>
                  <th className="px-6 py-3 text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">Parcela a Deduzir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {T.inss.map((faixa, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-gray-300">
                      {i === 0
                        ? `Até R$ ${fmtValor(faixa.max)}`
                        : `De R$ ${fmtValor(faixa.min)} até R$ ${fmtValor(faixa.max)}`
                      }
                    </td>
                    <td className="px-6 py-3 text-center text-emerald-400 font-semibold">
                      {formatarPercentual(faixa.aliquota)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-400">
                      R$ {fmtValor(faixa.deducao)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5">
            <p className="text-gray-500 text-xs">
              💡 <strong className="text-gray-400">Fórmula simplificada:</strong>{' '}
              <span className="text-emerald-400">(Salário × Alíquota) − Parcela a Deduzir</span>
            </p>
          </div>
        </div>

        {/* Tabela IRRF */}
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <span className="text-xl">🦁</span>
            <div>
              <h2 className="text-white font-bold text-lg">Tabela IRRF {T.ano}</h2>
              <p className="text-gray-500 text-xs">Imposto de Renda Retido na Fonte — Tabela progressiva</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-gray-400 font-semibold text-xs uppercase tracking-wider">Base de Cálculo Mensal</th>
                  <th className="px-6 py-3 text-center text-gray-400 font-semibold text-xs uppercase tracking-wider">Alíquota</th>
                  <th className="px-6 py-3 text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">Parcela a Deduzir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {T.irrf.map((faixa, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-gray-300">
                      {i === 0
                        ? `Até R$ ${fmtValor(faixa.max)}`
                        : faixa.max >= 999999
                          ? `Acima de R$ ${fmtValor(faixa.min)}`
                          : `De R$ ${fmtValor(faixa.min)} até R$ ${fmtValor(faixa.max)}`
                      }
                    </td>
                    <td className="px-6 py-3 text-center text-emerald-400 font-semibold">
                      {faixa.aliquota === 0 ? 'Isento' : formatarPercentual(faixa.aliquota)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-400">
                      R$ {fmtValor(faixa.deducao)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5">
            <p className="text-gray-500 text-xs">
              💡 <strong className="text-gray-400">Base de cálculo:</strong> Salário bruto − INSS − R$ {fmtValor(T.deducaoDependenteIR)} por dependente.
            </p>
          </div>
        </div>

        {/* Redutor IR */}
        <div className="bg-[#1a1a2e] border border-emerald-500/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-500/10 flex items-center gap-3 bg-emerald-500/5">
            <span className="text-xl">🎉</span>
            <div>
              <h2 className="text-white font-bold text-lg">Redutor Mensal do IR {T.ano} <span className="text-emerald-400 text-sm font-normal">(Novidade!)</span></h2>
              <p className="text-gray-500 text-xs">Lei nº 15.270/2025 — Em vigor desde janeiro de {T.ano}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-gray-400 font-semibold text-xs uppercase tracking-wider">Rendimento Tributável Mensal</th>
                  <th className="px-6 py-3 text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">Redução do IR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-emerald-500/[0.03]">
                  <td className="px-6 py-3 text-gray-300">Até R$ {fmtValor(T.redutorIR.isencaoAte)}</td>
                  <td className="px-6 py-3 text-right text-emerald-400 font-bold">100% — Isento!</td>
                </tr>
                <tr className="hover:bg-emerald-500/[0.03]">
                  <td className="px-6 py-3 text-gray-300">De R$ {fmtValor(T.redutorIR.isencaoAte)} até R$ {fmtValor(T.redutorIR.reducaoAte)}</td>
                  <td className="px-6 py-3 text-right text-blue-400 font-semibold">Redução gradual</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3 text-gray-300">Acima de R$ {fmtValor(T.redutorIR.reducaoAte)}</td>
                  <td className="px-6 py-3 text-right text-gray-500">Sem redução</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 space-y-2">
            <p className="text-gray-500 text-xs">
              💡 <strong className="text-gray-400">Como funciona:</strong> Primeiro calcula-se o IR pela tabela progressiva.
              Depois aplica-se a redução. Quem ganha até R$ {fmtValor(T.redutorIR.isencaoAte)} fica com IR zero.
            </p>
            <p className="text-gray-500 text-xs">
              📐 <strong className="text-gray-400">Fórmula (faixa intermédia):</strong>{' '}
              <span className="text-emerald-400/80 font-mono text-[11px]">Redução = IR × ({fmtValor(T.redutorIR.reducaoAte)} − Base) ÷ ({fmtValor(T.redutorIR.reducaoAte)} − {fmtValor(T.redutorIR.isencaoAte)})</span>
            </p>
          </div>
        </div>

        {/* Tabela Seguro-Desemprego */}
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <span className="text-xl">🛡️</span>
            <div>
              <h2 className="text-white font-bold text-lg">Tabela do Seguro-Desemprego {T.ano}</h2>
              <p className="text-gray-500 text-xs">Faixas para cálculo do valor das parcelas</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-gray-400 font-semibold text-xs uppercase tracking-wider">Média Salarial (3 últimos meses)</th>
                  <th className="px-6 py-3 text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">Valor da Parcela</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {T.seguroDesemprego.faixas.map((faixa, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-gray-300">
                      {i === 0
                        ? `Até R$ ${fmtValor(faixa.max)}`
                        : faixa.max >= 999999
                          ? `Acima de R$ ${fmtValor(faixa.min)}`
                          : `De R$ ${fmtValor(faixa.min)} até R$ ${fmtValor(faixa.max)}`
                      }
                    </td>
                    <td className="px-6 py-3 text-right text-emerald-400 font-semibold">
                      {faixa.tipo === 'percentual' && `Média × ${formatarPercentual(faixa.percentual)}`}
                      {faixa.tipo === 'formula' && `Excedente × ${formatarPercentual(faixa.percentual)} + R$ ${fmtValor(faixa.valorFixo)}`}
                      {faixa.tipo === 'fixo' && `R$ ${fmtValor(faixa.valorFixo)} (fixo)`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5">
            <p className="text-gray-500 text-xs">
              💡 <strong className="text-gray-400">Parcelas:</strong> De 3 a 5 parcelas, conforme o tempo de trabalho nos últimos 36 meses.
              Valor mínimo: R$ {fmtValor(T.seguroDesemprego.minimoParcelaValor)} (salário mínimo).
            </p>
          </div>
        </div>

        {/* Fontes */}
        {T.fontes && T.fontes.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5">
            <h3 className="text-white font-bold text-sm mb-3">📚 Fontes oficiais</h3>
            <ul className="space-y-2 text-sm">
              {T.fontes.map((fonte, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gray-600 mt-0.5">•</span>
                  {fonte.url ? (
                    <a
                      href={fonte.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-emerald-400 underline underline-offset-2 decoration-gray-700 hover:decoration-emerald-500/50 transition-colors"
                    >
                      {fonte.nome}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 inline ml-1 opacity-50">
                        <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-500">{fonte.nome || fonte}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="text-center pt-4">
          <p className="text-gray-500 text-sm mb-4">Agora que conhece as tabelas, faça seus cálculos:</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/rescisao" className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-medium px-5 py-2.5 rounded-xl transition-all text-sm">
              📋 Rescisão
            </Link>
            <Link to="/salario-liquido" className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-medium px-5 py-2.5 rounded-xl transition-all text-sm">
              💰 Salário Líquido
            </Link>
            <Link to="/ferias" className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-medium px-5 py-2.5 rounded-xl transition-all text-sm">
              🏖️ Férias
            </Link>
            <Link to="/seguro-desemprego" className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-medium px-5 py-2.5 rounded-xl transition-all text-sm">
              🛡️ Seguro-Desemprego
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
