import { ANO } from '../utils/calculos'

export default function Placeholder({ title, emoji }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-6">{emoji}</div>
      <h1 className="text-3xl font-bold text-white mb-3">{title}</h1>
      <p className="text-gray-400 text-lg">Em construção — esta calculadora estará disponível em breve!</p>
      <div className="mt-8 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-emerald-400 text-sm font-medium">Tabelas {ANO} já integradas</span>
      </div>
    </div>
  )
}
