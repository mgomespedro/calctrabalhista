import { Link } from 'react-router-dom'
import { ANO, TABELAS, formatarMoeda } from '../utils/calculos'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0f0f1a] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Top section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                C
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Calc<span className="text-emerald-400">Trabalhista</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Calculadoras trabalhistas gratuitas com tabelas {ANO} atualizadas.
              INSS, IRRF e nova isenção até {formatarMoeda(TABELAS.redutorIR.isencaoAte)}.
            </p>
          </div>

          {/* Calculadoras */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Calculadoras</h3>
            <ul className="space-y-2">
              <li><Link to="/rescisao" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Rescisão Trabalhista</Link></li>
              <li><Link to="/salario-liquido" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Salário Líquido</Link></li>
              <li><Link to="/ferias" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Férias</Link></li>
              <li><Link to="/decimo-terceiro" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">13º Salário</Link></li>
              <li><Link to="/horas-extras" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Horas Extras</Link></li>
              <li><Link to="/seguro-desemprego" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Seguro-Desemprego</Link></li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Institucional</h3>
            <ul className="space-y-2">
              <li><Link to="/sobre" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Sobre</Link></li>
              <li><Link to="/privacidade" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>

          {/* Tabelas */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Tabelas {ANO}</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-500 text-sm">INSS Progressivo</span></li>
              <li><span className="text-gray-500 text-sm">IRRF — Isenção {formatarMoeda(TABELAS.redutorIR.isencaoAte)}</span></li>
              <li><span className="text-gray-500 text-sm">Salário Mínimo: {formatarMoeda(TABELAS.salarioMinimo)}</span></li>
              <li><span className="text-gray-500 text-sm">Teto INSS: {formatarMoeda(TABELAS.tetoINSS)}</span></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 mb-6">
          <p className="text-amber-400/80 text-xs leading-relaxed text-center">
            ⚠️ <strong>Aviso legal:</strong> Esta calculadora tem caráter informativo e educacional. 
            Os valores apresentados são estimativas baseadas nas tabelas oficiais de {ANO}. 
            Para decisões legais ou financeiras, consulte um advogado trabalhista ou contador.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {currentYear} CalcTrabalhista. Todos os direitos reservados.
          </p>
          <p className="text-gray-700 text-xs">
            Tabelas atualizadas — {ANO}
          </p>
        </div>
      </div>
    </footer>
  )
}
