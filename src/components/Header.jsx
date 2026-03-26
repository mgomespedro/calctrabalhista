import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePremium } from '../context/PremiumContext'
import { ANO } from '../utils/calculos'
import ModalLoginPremium from './ModalLoginPremium'

const navigation = [
  { name: 'Início', path: '/' },
  { name: 'Rescisão', path: '/rescisao' },
  { name: 'Salário Líquido', path: '/salario-liquido' },
  { name: 'Férias', path: '/ferias' },
  { name: '13º Salário', path: '/decimo-terceiro' },
  { name: 'Horas Extras', path: '/horas-extras' },
  { name: 'Seguro-Desemprego', path: '/seguro-desemprego' },
  { name: `Tabelas ${ANO}`, path: '/tabelas' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const location = useLocation()
  const { isPremium, sessao, logout } = usePremium()

  return (
    <>
      <header className="bg-[#1a1a2e] border-b border-[#16213e] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                C
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-tight">
                  Calc<span className="text-emerald-400">Trabalhista</span>
                </span>
                <span className="hidden sm:inline text-[10px] text-emerald-400/70 ml-2 font-medium uppercase tracking-widest">
                  {ANO}
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === item.path
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Área Premium (desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              {isPremium ? (
                <>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                    </svg>
                    Premium ativo
                  </div>
                  <button
                    onClick={logout}
                    title={`Sair (${sessao?.email})`}
                    className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/premium"
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                    </svg>
                    Premium
                  </Link>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                  >
                    Já sou Premium
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <nav className="lg:hidden pb-4 border-t border-white/5 pt-3 mt-1">
              <div className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === item.path
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}

                {isPremium ? (
                  <>
                    <div className="mt-2 flex items-center justify-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold px-4 py-2.5 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                      </svg>
                      Premium ativo
                    </div>
                    <button
                      onClick={() => { logout(); setMenuOpen(false) }}
                      className="text-center text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
                    >
                      Sair da conta
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/premium"
                      onClick={() => setMenuOpen(false)}
                      className="mt-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                      </svg>
                      Seja Premium
                    </Link>
                    <button
                      onClick={() => { setModalOpen(true); setMenuOpen(false) }}
                      className="text-center text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
                    >
                      Já sou Premium
                    </button>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Modal de login */}
      {modalOpen && <ModalLoginPremium onFechar={() => setModalOpen(false)} />}
    </>
  )
}