import { getBlockedDaysLeft } from '../../utils/businessRules'

export default function BlockedUserBanner({ user }) {
    const days = getBlockedDaysLeft(user)

    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-slide-up">
            <div className="flex items-start gap-3">
                <span className="text-2xl">🚫</span>
                <div>
                    <p className="font-display font-bold text-red-800 text-sm">
                        Cuenta bloqueada temporalmente
                    </p>
                    <p className="text-red-700 text-xs mt-1">
                        Tienes <strong>{user.noShows} no-shows</strong> registrados. Tu cuenta está bloqueada
                        por <strong>{days} día{days !== 1 ? 's' : ''} más</strong>.
                        Durante este período no puedes realizar nuevas reservas.
                    </p>
                </div>
            </div>
        </div>
    )
}
