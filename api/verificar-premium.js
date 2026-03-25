export const config = {
    runtime: 'nodejs',
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' })

    const { email } = req.body

    if (!email || !email.includes('@')) {
        return res.status(400).json({ erro: 'E-mail inválido' })
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

    if (!STRIPE_SECRET_KEY) {
        return res.status(500).json({ erro: 'Chave Stripe não configurada' })
    }

    try {
        const clientesRes = await fetch(
            `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=5`,
            { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } }
        )
        const clientesData = await clientesRes.json()

        if (!clientesData.data || clientesData.data.length === 0) {
            return res.status(200).json({ premium: false, motivo: 'email_nao_encontrado' })
        }

        for (const cliente of clientesData.data) {
            const subsRes = await fetch(
                `https://api.stripe.com/v1/subscriptions?customer=${cliente.id}&limit=10`,
                { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } }
            )
            const subsData = await subsRes.json()

            const subAtiva = subsData.data?.find(
                s => s.status === 'active' || s.status === 'trialing'
            )

            if (subAtiva) {
                return res.status(200).json({
                    premium: true,
                    plano: subAtiva.items.data[0]?.price?.recurring?.interval === 'year' ? 'anual' : 'mensal',
                    validade: subAtiva.current_period_end
                        ? new Date(subAtiva.current_period_end * 1000).toISOString()
                        : null,
                    email: email.toLowerCase(),
                })
            }
        }

        return res.status(200).json({ premium: false, motivo: 'sem_subscricao_ativa' })

    } catch (err) {
        console.error('Erro Stripe:', err)
        return res.status(500).json({ erro: 'Erro ao verificar subscrição' })
    }
}