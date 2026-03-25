import { createContext, useContext, useEffect, useState } from 'react'

const PremiumContext = createContext(null)

const STORAGE_KEY = 'calct_premium_session'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 horas

export function PremiumProvider({ children }) {
    const [sessao, setSessao] = useState(null)      // { email, plano, validade }
    const [carregando, setCarregando] = useState(true)

    // Ao arrancar, verifica se há sessão guardada válida
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) {
                const dados = JSON.parse(raw)
                const expirou = Date.now() > dados.expiraEm
                if (!expirou) {
                    setSessao(dados)
                } else {
                    localStorage.removeItem(STORAGE_KEY)
                }
            }
        } catch {
            localStorage.removeItem(STORAGE_KEY)
        } finally {
            setCarregando(false)
        }
    }, [])

    // Verifica e-mail no Stripe via função serverless
    async function verificarEmail(email) {
        const res = await fetch('/api/verificar-premium', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim().toLowerCase() }),
        })

        if (!res.ok) throw new Error('Erro ao contactar o servidor')

        const dados = await res.json()

        if (!dados.premium) {
            return { sucesso: false, motivo: dados.motivo }
        }

        // Guarda sessão por 24h
        const sessaoNova = {
            email: email.trim().toLowerCase(),
            plano: dados.plano,
            validade: dados.validade,
            expiraEm: Date.now() + SESSION_DURATION_MS,
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessaoNova))
        setSessao(sessaoNova)

        return { sucesso: true, plano: dados.plano }
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY)
        setSessao(null)
    }

    const isPremium = !!sessao

    return (
        <PremiumContext.Provider value={{ sessao, isPremium, carregando, verificarEmail, logout }}>
            {children}
        </PremiumContext.Provider>
    )
}

// Hook para usar em qualquer componente
export function usePremium() {
    const ctx = useContext(PremiumContext)
    if (!ctx) throw new Error('usePremium deve ser usado dentro de PremiumProvider')
    return ctx
}