import { Link } from 'react-router-dom'

export default function Termos() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-emerald-400 transition-colors">Início</Link>
          <span>/</span>
          <span className="text-gray-400">Termos de Uso</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Termos de Uso</h1>
        <p className="text-gray-500 text-sm">Última atualização: março de 2026</p>
      </div>
      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8">
        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-base mb-2">1. Aceitação dos termos</h2>
            <p>Ao acessar e utilizar o CalcTrabalhista, você concorda com estes Termos de Uso.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">2. Natureza do serviço</h2>
            <p className="mb-2">O CalcTrabalhista é uma ferramenta online de caráter <strong className="text-white">exclusivamente informativo e educacional</strong>.</p>
            <p><strong className="text-amber-400">O CalcTrabalhista NÃO substitui a consulta a um advogado trabalhista, contador ou profissional especializado.</strong></p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">3. Precisão dos cálculos</h2>
            <p>Fazemos o máximo esforço para manter as tabelas atualizadas com base nas fontes oficiais. No entanto, não garantimos a exatidão absoluta dos resultados.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">4. Limitação de responsabilidade</h2>
            <p className="mb-1">O CalcTrabalhista não se responsabiliza por:</p>
            <p className="mb-1">- Decisões tomadas com base nos resultados das calculadoras</p>
            <p className="mb-1">- Diferenças entre os valores calculados e os valores reais</p>
            <p>- Prejuízos diretos ou indiretos decorrentes do uso do site</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">5. Propriedade intelectual</h2>
            <p>Todo o conteúdo do CalcTrabalhista é protegido pelas leis de propriedade intelectual aplicáveis.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">6. Legislação aplicável</h2>
            <p>Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">7. Contato</h2>
            <p>Para dúvidas: <span className="text-emerald-400">contato@calctrabalhista.com.br</span></p>
          </section>
        </div>
      </div>
    </div>
  )
}
