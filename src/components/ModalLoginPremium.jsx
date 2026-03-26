import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePremium } from '../context/PremiumContext'

export default function ModalLoginPremium({ onFechar }) {
    const { verificarEmail } = usePremium()
    const [email, setEmail] = useState('')
    const [estado, setEstado] = useState('idle')
    const [mensagemErro, setMensagemErro] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 50)
    }, [])

    async function handleSubmit() {
        if (!email.includes('@')) {
            setMensagemErro('Insira um e-mail válido.')
            setEstado('erro')
            setTimeout(() => inputRef.current?.focus(), 50)
            return
        }

        setEstado('carregando')
        setMensagemErro('')

        try {
            const resultado = await verificarEmail(email)

            if (resultado.sucesso) {
                setEstado('sucesso')
                setTimeout(() => onFechar(), 2000)
            } else {
                setEstado('erro')
                if (resultado.motivo === 'email_nao_encontrado') {
                    setMensagemErro('Nenhuma conta encontrada com este e-mail. Verifique se é o mesmo usado no pagamento.')
                } else if (resultado.motivo === 'sem_subscricao_ativa') {
                    setMensagemErro('Este e-mail não possui assinatura Premium ativa.')
                } else {
                    setMensagemErro('Não foi possível verificar. Tente novamente.')
                }
                setTimeout(() => inputRef.current?.focus(), 50)
            }
        } catch {
            setEstado('erro')
            setMensagemErro('Erro de ligação. Verifique a sua internet e tente novamente.')
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onFechar}
            />

            {/* Card */}
            <div className="relative w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 shadow-2xl">

                {/* Botão fechar */}
                <button
                    onClick={onFechar}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                </button>

                {/* Ícone */}
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-amber-400">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                    </svg>
                </div>

                {estado === 'sucesso' ? (
                    <div className="text-center py-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7 text-emerald-400">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-white font-bold text-xl mb-1">Bem-vindo ao Premium! 🎉</h2>
                        <p className="text-gray-400 text-sm">Acesso liberado. Redirecionando...</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-white font-bold text-xl mb-1">Acesso Premium</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Insira o e-mail usado na assinatura para liberar o acesso.
                        </p>

                        <div className="space-y-3">
                            <input
                                ref={inputRef}
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                placeholder="seu@email.com"
                                disabled={estado === 'carregando'}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all disabled:opacity-50"
                            />

                            {estado === 'erro' && (
                                <p className="text-red-400 text-xs flex items-start gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5">
                                        <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm0-4a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM7.25 6.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0v-2.5Z" clipRule="evenodd" />
                                    </svg>
                                    {mensagemErro}
                                </p>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={estado === 'carregando' || !email}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all duration-200 text-sm"
                            >
                                {estado === 'carregando' ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Verificando...
                                    </span>
                                ) : 'Liberar Acesso Premium'}
                            </button>
                        </div>

                        <div className="mt-5 pt-5 border-t border-white/5 text-center">
                            <p className="text-gray-600 text-xs">
                                Ainda não é Premium?{' '}
                                <Link to="/premium" className="text-amber-400 hover:text-amber-300 transition-colors" onClick={onFechar}>
                                    Assine agora
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}