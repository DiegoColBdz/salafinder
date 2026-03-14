import { MAX_ACTIVE_RESERVATIONS } from '../../utils/businessRules'

export default function ReservationLimitBanner({ count }) {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 animate-slide-up">
            <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                    <p className="font-display font-bold text-amber-800 text-sm">
                        Límite de reservas activas alcanzado
                    </p>
                    <p className="text-amber-700 text-xs mt-1">
                        Tienes <strong>{count} reservas activas</strong> (máximo {MAX_ACTIVE_RESERVATIONS}).
                        Cancela una reserva existente para poder hacer una nueva.
                    </p>
                </div>
            </div>
        </div>
    )
}
