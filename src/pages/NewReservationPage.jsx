import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { createReservation } from '../services/api'
import {
    isUserBlocked,
    hasTimeConflict,
    getAlternativeSlots,
    getActiveReservationsCount,
    MAX_ACTIVE_RESERVATIONS,
    isTooSoon,
} from '../utils/businessRules'
import BlockedUserBanner from '../components/ui/BlockedUserBanner'
import ReservationLimitBanner from '../components/ui/ReservationLimitBanner'

const today = new Date().toISOString().split('T')[0]

export default function NewReservationPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { state, dispatch } = useApp()
    const space = state.spaces.find(s => s.id === id)
    const user = state.currentUser

    const [form, setForm] = useState({
        date: today, startTime: '', endTime: '', purpose: '', attendeeCount: '',
    })
    const [errors, setErrors] = useState({})
    const [conflictInfo, setConflictInfo] = useState(null)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    if (!space) return (
        <div className="text-center py-20">
            <p className="text-gray-500">Espacio no encontrado.</p>
            <button onClick={() => navigate('/espacios')} className="btn-secondary mt-4">Volver</button>
        </div>
    )

    const blocked = isUserBlocked(user)
    const activeCount = getActiveReservationsCount(state.reservations, user.id)
    const limitReached = activeCount >= MAX_ACTIVE_RESERVATIONS

    const set = (field) => (e) => {
        setForm(f => ({ ...f, [field]: e.target.value }))
        setErrors(er => ({ ...er, [field]: '' }))
        setConflictInfo(null)
    }

    const validate = () => {
        const e = {}
        if (!form.date) e.date = 'Selecciona una fecha.'
        else if (form.date < today) e.date = 'No puedes reservar en fechas pasadas.'
        if (!form.startTime) e.startTime = 'Selecciona la hora de inicio.'
        if (!form.endTime) e.endTime = 'Selecciona la hora de fin.'
        else if (form.startTime && form.endTime <= form.startTime)
            e.endTime = 'La hora de fin debe ser mayor a la de inicio.'
        if (form.date === today && form.startTime && isTooSoon(form.date, form.startTime))
            e.startTime = 'Debes reservar con al menos 1 hora de anticipación.'
        if (!form.purpose.trim() || form.purpose.trim().length < 5)
            e.purpose = 'El propósito debe tener al menos 5 caracteres.'
        const count = parseInt(form.attendeeCount)
        if (!form.attendeeCount) e.attendeeCount = 'Indica el número de asistentes.'
        else if (count < 1) e.attendeeCount = 'Debe haber al menos 1 asistente.'
        else if (count > space.capacity)
            e.attendeeCount = `Máximo ${space.capacity} personas en este espacio.`
        return e
    }

    const checkConflict = () => {
        if (!form.date || !form.startTime || !form.endTime) return
        const conflict = hasTimeConflict(state.reservations, id, form.date, form.startTime, form.endTime)
        if (conflict) {
            const alternatives = getAlternativeSlots(state.reservations, id, form.date)
            setConflictInfo({ conflict, alternatives })
        } else {
            setConflictInfo(null)
        }
    }

    const handleSubmit = async (ev) => {
        ev.preventDefault()
        const e = validate()
        if (Object.keys(e).length) return setErrors(e)
        if (conflictInfo) return

        setLoading(true)
        try {
            const newRes = {
                spaceId: id,
                userId: user.id,
                date: form.date,
                startTime: form.startTime,
                endTime: form.endTime,
                purpose: form.purpose,
                attendeeCount: parseInt(form.attendeeCount),
                status: space.requiresApproval ? 'pending' : 'approved',
                createdAt: new Date().toISOString(),
            }
            const saved = await createReservation(newRes)
            dispatch({ type: 'ADD_RESERVATION_SUCCESS', payload: saved })
            setSubmitted(true)
            setTimeout(() => navigate('/mis-reservas'), 1500)
        } catch {
            dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Error al crear la reserva. Intenta de nuevo.' } })
        } finally {
            setLoading(false)
        }
    }

    if (submitted) return (
        <div className="flex flex-col items-center justify-center py-20 animate-slide-up">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="font-display font-bold text-xl text-gray-900">¡Reserva enviada!</h2>
            <p className="text-gray-500 text-sm mt-1">Redirigiendo a tus reservas...</p>
        </div>
    )

    return (
        <div className="animate-fade-in max-w-xl">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
                ← Volver
            </button>

            <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Nueva reserva</h1>
            <p className="text-sm text-gray-500 mb-6">
                <span className="font-medium text-gray-700">{space.name}</span> · {space.building} · Cap. {space.capacity}
                {space.requiresApproval && <span className="ml-2 badge bg-amber-100 text-amber-700">Requiere aprobación</span>}
            </p>

            {blocked && <BlockedUserBanner user={user} />}
            {limitReached && !blocked && <ReservationLimitBanner count={activeCount} />}

            <form onSubmit={handleSubmit} noValidate className="card p-6 space-y-5">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="date">Fecha *</label>
                    <input id="date" type="date" min={today} value={form.date}
                        onChange={set('date')} disabled={blocked || limitReached}
                        className={`input-field ${errors.date ? 'input-error' : ''} disabled:opacity-50 disabled:cursor-not-allowed`} />
                    {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="startTime">Hora inicio *</label>
                        <input id="startTime" type="time" value={form.startTime}
                            onChange={set('startTime')} onBlur={checkConflict}
                            disabled={blocked || limitReached}
                            className={`input-field ${errors.startTime ? 'input-error' : ''} disabled:opacity-50 disabled:cursor-not-allowed`} />
                        {errors.startTime && <p className="text-xs text-red-600 mt-1">{errors.startTime}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="endTime">Hora fin *</label>
                        <input id="endTime" type="time" value={form.endTime}
                            onChange={set('endTime')} onBlur={checkConflict}
                            disabled={blocked || limitReached}
                            className={`input-field ${errors.endTime ? 'input-error' : ''} disabled:opacity-50 disabled:cursor-not-allowed`} />
                        {errors.endTime && <p className="text-xs text-red-600 mt-1">{errors.endTime}</p>}
                    </div>
                </div>

                {conflictInfo && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm animate-slide-up">
                        <p className="font-medium text-red-800 mb-1">⚠️ Conflicto de horario detectado</p>
                        <p className="text-red-700 text-xs mb-2">
                            El espacio ya está reservado de <strong>{conflictInfo.conflict.startTime}</strong> a <strong>{conflictInfo.conflict.endTime}</strong> ese día.
                        </p>
                        {conflictInfo.alternatives.length > 0 && (
                            <>
                                <p className="text-xs font-medium text-red-800 mb-1">Horarios disponibles:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {conflictInfo.alternatives.map((a, i) => (
                                        <button key={i} type="button"
                                            onClick={() => { setForm(f => ({ ...f, startTime: a.startTime, endTime: a.endTime })); setConflictInfo(null) }}
                                            className="px-2.5 py-1 bg-white border border-red-300 rounded text-xs text-red-700 hover:bg-red-100 transition-colors"
                                        >
                                            {a.startTime} – {a.endTime}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="purpose">Propósito *</label>
                    <textarea id="purpose" rows={3}
                        placeholder="Ej: Clase práctica de programación, reunión de proyecto..."
                        value={form.purpose} onChange={set('purpose')}
                        disabled={blocked || limitReached}
                        className={`input-field resize-none ${errors.purpose ? 'input-error' : ''} disabled:opacity-50 disabled:cursor-not-allowed`} />
                    {errors.purpose && <p className="text-xs text-red-600 mt-1">{errors.purpose}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="attendeeCount">
                        Número de asistentes * <span className="text-gray-400 font-normal">(máx. {space.capacity})</span>
                    </label>
                    <input id="attendeeCount" type="number" min={1} max={space.capacity}
                        placeholder={`1 – ${space.capacity}`} value={form.attendeeCount}
                        onChange={set('attendeeCount')} disabled={blocked || limitReached}
                        className={`input-field ${errors.attendeeCount ? 'input-error' : ''} disabled:opacity-50 disabled:cursor-not-allowed`} />
                    {errors.attendeeCount && <p className="text-xs text-red-600 mt-1">{errors.attendeeCount}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary flex-1"
                        disabled={!!conflictInfo || blocked || limitReached || loading}>
                        {loading ? 'Guardando...' : space.requiresApproval ? 'Enviar solicitud' : 'Confirmar reserva'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
                        Cancelar
                    </button>
                </div>

            </form>
        </div>
    )
}
