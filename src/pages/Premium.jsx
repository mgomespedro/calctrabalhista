import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ANO } from '../utils/calculos'

const FEATURES_GRATIS = [
  '6 calculadoras trabalhistas',
  'Tabelas oficiais atualizadas',
  'Exportar PDF básico',
  'Comparador demissão vs acordo',
  'Acesso sem cadastro',
]

const FEATURES_PREMIUM = [
  { texto: 'Tudo do plano gratuito', destaque: false },
  { texto: 'PDF profissional com logo e cabeçalho personalizado', destaque: true },
  { texto: 'Histórico de simulações salvas', destaque: true },
  { texto: 'Comparador de múltiplos cenários (até 5)', destaque: true },
  { texto: 'Simulação de evolução salarial anual', destaque: true },
  { texto: 'Exportar relatórios em Excel (.xlsx)', destaque: true },
  { texto: 'Calculadora de custo total para o empregador', destaque: true },
  { texto: 'Alertas de atualização de tabelas por e-mail', destaque: false },
  { texto: 'Suporte prioritário por e-mail', destaque: false },
  { texto: 'Sem anúncios', destaque: false },
]

const PLANOS = [
  {
    id: 'mensal',
    nome: 'Mensal',
    preco: 14.90,
    periodo: 'mês',
    economia: null,
    badge: null,
  },
  {
    id: 'anual',
    nome: 'Anual',
    preco: 9.90,
    periodo: 'mês',
    precoAnual: 118.80,
    economia: 'Economize R$ 60/ano',
    badge: 'Mais popular',
  },
]

const DEPOIMENTOS = [
  {
    nome: 'Marcos A.',
    cargo: 'Analista de RH — São Paulo',
    texto: 'Uso todos os dias para calcular rescisões dos colaboradores. O PDF profissional me poupou horas de trabalho.',
    avatar: 'M',
  },
  {
    nome: 'Juliana F.',
    cargo: 'Advogada Trabalhista — Belo Horizonte',
    texto: 'O comparador de cenários é excelente para mostrar aos clientes as diferenças entre demissão e acordo mútuo.',
    avatar: 'J',
  },
  {
    nome: 'Ricardo S.',
    cargo: 'Contador — Porto Alegre',
    texto: 'Finalmente uma calculadora que aplica corretamente a nova isenção de IR de 2026. Recomendo para todos os colegas.',
    avatar: 'R',
  },
]

export default function Premium() {
  const [planoSelecionado, setPlanoSelecionado] = useState('anual')

  const plano = PLANOS.find(p => p.id === planoSelecionado)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
          <span className="text-amber-400 text-sm font-medium">⭐ CalcTrabalhista Premium</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Leve seus cálculos ao próximo nível
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Relatórios profissionais, histórico completo e muito mais — por menos de um café por semana.
        </p>
      </div>

      {/* Comparativo Grátis vs Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {/* Grátis */}
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
          <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider mb-1">Plano Grátis</h3>
          <p className="text-2xl font-extrabold text-white mb-4">R$ 0</p>
          <ul className="space-y-3">
            {FEATURES_GRATIS.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-emerald-500/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Premium */}
        <div className="bg-gradient-to-b from-amber-500/10 to-orange-500/5 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-1">Plano Premium</h3>
          <p className="text-2xl font-extrabold text-white mb-4">A partir de R$ 9,90/mês</p>
          <ul className="space-y-3 relative">
            {FEATURES_PREMIUM.map((f, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${f.destaque ? 'text-white font-medium' : 'text-gray-400'}`}>
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {f.texto}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Seletor de planos */}
      <div className="mb-8">
        <h2 className="text-white font-bold text-xl text-center mb-6">Escolha seu plano</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          {PLANOS.map(p => (
            <button
              key={p.id}
              onClick={() => setPlanoSelecionado(p.id)}
              className={`relative text-left p-5 rounded-2xl border transition-all duration-200 ${
                planoSelecionado === p.id
                  ? 'border-amber-500/50 bg-amber-500/5'
                  : 'border-white/5 bg-[#1a1a2e] hover:border-white/10'
              }`}
            >
              {p.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap bg-amber-500 text-black">
                  {p.badge}
                </span>
              )}
              <p className={`text-sm font-semibold mb-1 ${planoSelecionado === p.id ? 'text-amber-400' : 'text-gray-400'}`}>
                {p.nome}
              </p>
              <p className="text-white font-extrabold text-2xl">
                R$ {p.preco.toFixed(2).replace('.', ',')}
                <span className="text-gray-500 text-sm font-normal">/{p.periodo}</span>
              </p>
              {p.id === 'anual' && (
                <p className="text-gray-500 text-xs mt-0.5">cobrado R$ {p.precoAnual.toFixed(2).replace('.', ',')} anualmente</p>
              )}
              {p.economia && (
                <p className="text-amber-400 text-xs font-semibold mt-2">{p.economia}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CTA principal */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8 text-center mb-12">
        <p className="text-gray-400 text-sm mb-1">Plano selecionado: <strong className="text-white">{plano.nome}</strong></p>
        <p className="text-4xl font-extrabold text-white mb-1">
          R$ {plano.preco.toFixed(2).replace('.', ',')}
          <span className="text-gray-500 text-lg font-normal">/{plano.periodo}</span>
        </p>
        {plano.economia && (
          <p className="text-amber-400 text-sm font-semibold mb-4">{plano.economia}</p>
        )}
        {!plano.economia && <div className="mb-4" />}

        {/* Botão — href será substituído pelo link Hotmart */}
        <a
          href="#"
          onClick={e => { e.preventDefault(); alert('Gateway de pagamento em breve!') }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-10 py-4 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 text-base"
        >
          Assinar Agora — R$ {plano.preco.toFixed(2).replace('.', ',')}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
          </svg>
        </a>

        <div className="flex items-center justify-center gap-5 mt-5 text-gray-600 text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pagamento seguro
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            7 dias de garantia
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Cartão, Pix ou boleto
          </span>
        </div>
      </div>

      {/* Depoimentos */}
      <div className="mb-12">
        <h2 className="text-white font-bold text-xl text-center mb-6">Quem já usa o Premium</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DEPOIMENTOS.map((d, i) => (
            <div key={i} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                  {d.avatar}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{d.nome}</p>
                  <p className="text-gray-600 text-xs">{d.cargo}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">"{d.texto}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="text-white font-bold text-xl text-center mb-6">Dúvidas frequentes</h2>
        <div className="space-y-3">
          {[
            {
              q: 'Posso cancelar quando quiser?',
              r: 'Sim. Planos mensais e anuais podem ser cancelados a qualquer momento, sem multas.',
            },
            {
              q: 'Como funciona a garantia de 7 dias?',
              r: 'Se não ficar satisfeito por qualquer motivo nos primeiros 7 dias, devolvemos 100% do valor pago. Sem perguntas.',
            },
            {
              q: 'As tabelas são atualizadas automaticamente?',
              r: `Sim. Atualizamos as tabelas oficiais (INSS, IRRF, salário mínimo) sempre que há mudança. Em ${ANO}, já aplicamos a nova isenção de IR.`,
            },
            {
              q: 'Posso usar em tablet e celular?',
              r: 'Sim, o CalcTrabalhista é totalmente responsivo e funciona em qualquer dispositivo com navegador.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-[#1a1a2e] border border-white/5 rounded-xl px-5 py-4">
              <p className="text-white font-semibold text-sm mb-1">{item.q}</p>
              <p className="text-gray-500 text-sm">{item.r}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-4">Ainda em dúvida? O plano gratuito continua disponível para sempre.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#"
            onClick={e => { e.preventDefault(); alert('Gateway de pagamento em breve!') }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200 text-base"
          >
            Assinar Premium
          </a>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 text-base"
          >
            Continuar grátis
          </Link>
        </div>
      </div>

    </div>
  )
}
