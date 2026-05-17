import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { StatusBadge } from '../ui/index.jsx'
import ConfirmModal from '../ui/ConfirmModal'
import { cancelReservation } from '../../services/api'

const ESTADO_MAP = {
  Pendiente: 'pending',
  Aprobado:  'approved',
  Rechazado: 'rejected',
  Cancelado: 'cancelled',
}

export default function ReservationCard({ reservation }) {
  const { state, dispatch } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const space = state.spaces.find(s => s.id === reservation.id_espacio)
  const canCancel = ['Pendiente', 'Aprobado'].includes(reservation.estado)

  const handleCancel = async () => {
    try {
      await cancelReservation(reservation.id)
      dispatch({ type: 'CANCEL_RESERVATION', payload: reservation.id })
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'info', message: 'Reserva cancelada.' } })
    } catch (err) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: err.message } })
    }
  }

  return (
    <>
      <div className="card p-4 animate-fade-in">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="font-display font-bold text-gray-900 text-sm">
              {space?.nombre ?? reservation.espacio?.nombre ?? 'Espacio'}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {space?.edificio ?? reservation.espacio?.edificio ?? ''}
            </p>
          </div>
          <StatusBadge status={ESTADO_MAP[reservation.estado] ?? 'pending'} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1.5">
            <span>📅</span><span>{reservation.fecha}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🕐</span>
            <span>{reservation.hora_inicio} – {reservation.hora_fin}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>👥</span><span>{reservation.asistentes} asistentes</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 italic mb-3 line-clamp-1">
          "{reservation.proposito}"
        </p>

        {canCancel && (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            Cancelar reserva
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleCancel}
        title="Cancelar reserva"
        message={`¿Estás seguro de que deseas cancelar la reserva del ${reservation.fecha} de ${reservation.hora_inicio} a ${reservation.hora_fin}?`}
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        danger
      />
    </>
  )
}