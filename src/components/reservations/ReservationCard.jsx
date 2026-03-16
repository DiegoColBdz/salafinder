import { useApp } from '../../context/AppContext'
import { StatusBadge } from '../ui/Index.jsx'
import { canCancel } from '../../utils/permissions'
import { updateReservation } from '../../services/api'

export default function ReservationCard({ reservation }) {
  const { state, dispatch } = useApp()
  const space = state.spaces.find(s => s.id === reservation.spaceId)
  const user  = state.currentUser
  const showCancel = canCancel(user, reservation)

  const handleCancel = async () => {
    try {
      await updateReservation(reservation.id, { status: 'cancelled' })
      dispatch({ type: 'CANCEL_RESERVATION', payload: reservation.id })
    } catch {
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Error al cancelar la reserva.' } })
    }
  }

  return (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="font-display font-bold text-gray-900 text-sm">{space?.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{space?.building}</p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1.5">
          <span>📅</span><span>{reservation.date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🕐</span><span>{reservation.startTime} – {reservation.endTime}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>👥</span><span>{reservation.attendeeCount} asistentes</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 italic mb-3 line-clamp-1">"{reservation.purpose}"</p>

      {showCancel && (
        <button onClick={handleCancel}
          className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors">
          Cancelar reserva
        </button>
      )}
    </div>
  )
}