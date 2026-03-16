import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useFetch } from '../hooks/useFetch'
import { getReservations } from '../services/api'
import WeekCalendar from '../components/spaces/WeekCalendar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'

const TYPE_ICONS = { laboratorio: '💻', sala: '🚪', cancha: '⚽', auditorio: '🎭' }

export default function CalendarPage() {
    const { state, dispatch } = useApp()
    const [selectedSpace, setSelectedSpace] = useState(state.spaces[0]?.id || '')

    const { data: reservations, loading, error } = useFetch(
        () => getReservations().then(data => {
            dispatch({ type: 'SET_RESERVATIONS', payload: data })
            return data
        }),
        []
    )

    const space = state.spaces.find(s => s.id === selectedSpace)

    if (loading) return <LoadingSpinner message="Cargando calendario..." />
    if (error) return <ErrorState message={error} />

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="font-display font-bold text-2xl text-gray-900">Calendario de disponibilidad</h1>
                <p className="text-gray-500 text-sm mt-1">Consulta la disponibilidad semanal de cada espacio</p>
            </div>

            <div className="card p-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Selecciona un espacio
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {state.spaces.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setSelectedSpace(s.id)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all ${selectedSpace === s.id
                                ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                                : 'bg-white text-gray-600 border-surface-border hover:border-brand-300 hover:bg-brand-50'
                                }`}
                        >
                            <span className="text-xl">{TYPE_ICONS[s.type]}</span>
                            <span className="text-center leading-tight line-clamp-2">{s.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {space && (
                <div className="flex items-center gap-3 mb-4 px-1">
                    <span className="text-2xl">{TYPE_ICONS[space.type]}</span>
                    <div>
                        <h2 className="font-display font-bold text-lg text-gray-900">{space.name}</h2>
                        <p className="text-xs text-gray-500">
                            {space.building} · Cap. {space.capacity} personas
                            {space.requiresApproval &&
                                <span className="ml-2 badge bg-amber-100 text-amber-700">Requiere aprobación</span>
                            }
                        </p>
                    </div>
                </div>
            )}

            {selectedSpace && (
                <WeekCalendar
                    spaceId={selectedSpace}
                    reservations={reservations || state.reservations}
                />
            )}
        </div>
    )
}
