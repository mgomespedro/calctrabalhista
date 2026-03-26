import { usePremium } from '../context/PremiumContext'

const AdBanner = ({ slot, format = 'auto', className = '' }) => {
    const { isPremium } = usePremium()

    if (isPremium) return null

    return (
        <div className={`ad-container my-6 flex justify-center ${className}`}>
            {/* Placeholder - será substituído pelo código real do AdSense após aprovação */}
            <div className="w-full max-w-3xl bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 text-sm">
                <p>Espaço publicitário</p>
            </div>
        </div>
    )
}

export default AdBanner