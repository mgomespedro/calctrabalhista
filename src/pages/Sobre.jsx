import { Link } from 'react-router-dom'
import { ANO } from '../utils/calculos'

export default function Sobre() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-emerald-400 transition-colors">Início</Link>
          <span>/</span>
          <span className="text-gray-400">Sobre</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Sobre o CalcTrabalhista</h1>
      </div>

      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-white font-bold text-lg">O que é o CalcTrabalhista?</h2>
          <p>O CalcTrabalhista é uma plataforma gratuita de calculadoras trabalhistas brasileiras, criada para ajudar trabalhadores, empregadores, profissionais de RH e advogados a calcular verbas trabalhistas de forma rápida, precisa e acessível.</p>
          <p>Nossas calculadoras são atualizadas anualmente com as tabelas oficiais do governo brasileiro, incluindo INSS, IRRF, salário mínimo e demais valores de referência.</p>
        </div>

        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-white font-bold text-lg">Nossas calculadoras</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span><strong className="text-white">Rescisão Trabalhista</strong> — calcula todas as verbas rescisórias para qualquer tipo de demissão</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span><strong className="text-white">Salário Líquido</strong> — descubra quanto sobra após INSS e IR, com a nova isenção {ANO}</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span><strong className="text-white">Férias</strong> — integrais, proporcionais e abono pecuniário com 1/3 constitucional</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span><strong className="text-white">13º Salário</strong> — simule a 1ª e 2ª parcelas com todos os descontos</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span><strong className="text-white">Horas Extras</strong> — calcule com adicional de 50%, 100% e DSR</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span><strong className="text-white">Seguro-Desemprego</strong> — descubra parcelas e valores com base nos últimos salários</span></li>
          </ul>
        </div>

        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-white font-bold text-lg">Compromisso com a precisão</h2>
          <p>Todos os cálculos são baseados nas tabelas oficiais publicadas pelo governo brasileiro, incluindo a Portaria Interministerial MPS/MF, a Receita Federal e o Ministério do Trabalho e Emprego. As tabelas são atualizadas anualmente, normalmente em janeiro, após a publicação dos novos valores.</p>
          <p>Apesar do nosso compromisso com a precisão, os resultados têm caráter <strong className="text-white">informativo e educacional</strong>. Para decisões legais ou financeiras importantes, recomendamos sempre a consulta a um advogado trabalhista ou profissional de contabilidade.</p>
        </div>

        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-white font-bold text-lg">Privacidade e segurança</h2>
          <p>O CalcTrabalhista <strong className="text-white">não armazena nenhum dado pessoal</strong>. Todos os cálculos são realizados localmente no seu navegador. Não pedimos cadastro, login ou qualquer informação pessoal. Cumprimos integralmente a LGPD (Lei Geral de Proteção de Dados).</p>
        </div>

        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-white font-bold text-lg">Contato</h2>
          <p>Tem dúvidas, sugestões ou encontrou algum erro nos cálculos? Entre em contato conosco:</p>
          <p className="text-emerald-400 font-medium">contato@calctrabalhista.com.br</p>
        </div>
      </div>
    </div>
  )
}
