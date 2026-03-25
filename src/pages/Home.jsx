import { Link } from 'react-router-dom'
import { ANO, TABELAS, formatarMoeda } from '../utils/calculos'

const calculadoras = [
  {
    title: 'Rescisão Trabalhista',
    description: 'Calcule seu acerto: saldo de salário, aviso prévio, férias, 13º, FGTS e multa.',
    path: '/rescisao',
    icon: '📋',
    badge: 'Mais usada',
    badgeColor: 'bg-rose-500/15 text-rose-400',
  },
  {
    title: 'Salário Líquido',
    description: 'Descubra quanto sobra no bolso após descontos de INSS e Imposto de Renda.',
    path: '/salario-liquido',
    icon: '💰',
    badge: 'Nova isenção IR',
    badgeColor: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    title: 'Férias',
    description: 'Calcule férias integrais, proporcionais e abono pecuniário com 1/3 constitucional.',
    path: '/ferias',
    icon: '🏖️',
    badge: null,
  },
  {
    title: '13º Salário',
    description: 'Simule a 1ª e 2ª parcelas do décimo terceiro com todos os descontos.',
    path: '/decimo-terceiro',
    icon: '🎄',
    badge: null,
  },
  {
    title: 'Horas Extras',
    description: 'Calcule o valor das horas extras com adicional de 50%, 100% e DSR.',
    path: '/horas-extras',
    icon: '⏰',
    badge: null,
  },
  {
    title: 'Seguro-Desemprego',
    description: 'Descubra quantas parcelas e quanto você vai receber de seguro-desemprego.',
    path: '/seguro-desemprego',
    icon: '🛡️',
    badge: null,
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 text-sm font-medium">Tabelas {ANO} atualizadas</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            Descubra <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">quanto te devem</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            Calcule rescisão, salário líquido, férias, 13º e mais — grátis, em 30 segundos.
          </p>

          {/* Highlight */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 mb-10">
            <span className="text-amber-400 text-sm font-medium">🎉 Novidade {ANO}: Isenção de IR para quem ganha até {formatarMoeda(TABELAS.redutorIR.isencaoAte)}!</span>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/rescisao"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 text-base"
            >
              Calcular Rescisão
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              to="/salario-liquido"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 text-base"
            >
              Calcular Salário Líquido
            </Link>
          </div>
        </div>
      </section>

      {/* Calculator Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {calculadoras.map((calc) => (
            <Link
              key={calc.path}
              to={calc.path}
              className="group relative bg-[#1a1a2e] hover:bg-[#1e1e35] border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
            >
              {/* Badge */}
              {calc.badge && (
                <span className={`absolute top-4 right-4 text-[11px] font-semibold px-2.5 py-1 rounded-full ${calc.badgeColor}`}>
                  {calc.badge}
                </span>
              )}

              {/* Icon */}
              <div className="text-3xl mb-4">{calc.icon}</div>

              {/* Content */}
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors">
                {calc.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {calc.description}
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center gap-1 text-emerald-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Calcular agora
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500/60">
              <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            100% gratuito
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500/60">
              <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            Tabelas oficiais {ANO}
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500/60">
              <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            Sem cadastro
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500/60">
              <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            LGPD compliant
          </div>
        </div>
      </section>
    </div>
  )
}
