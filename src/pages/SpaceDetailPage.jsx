import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const TYPE_ICONS = { laboratorio: '💻', sala: '🚪', cancha: '⚽', auditorio: '🎭' }

export default function SpaceDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { state } = useApp()
    const space = state.spaces.find(s => s.id === id)

    if (!space) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">Espacio no encontrado.</p>
                <button onClick={() => navigate('/espacios')} className="btn-secondary mt-4">Volver</button>
            </div>
        )
    }

    const today = new Date().toISOString().split('T')[0]
    const upcomingRes = state.reservations
        .filter(r => r.spaceId === id && r.status === 'approved' && r.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
        .slice(0, 5)

    return (
        <div className="animate-fade-in max-w-3xl">
            {/* Volver */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                ← Volver
            </button>

            {/* Info principal */}
            <div className="card p-6 mb-5">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center text-3xl flex-shrink-0">
                        {/* TYPE_ICONS[space.type] */}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h1 className="font-display font-bold text-xl text-gray-900">{space.name}</h1>
                            {space.requiresApproval && (
                                <span className="badge bg-amber-100 text-amber-700">Requiere aprobación</span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm">{space.description}</p>
                    </div>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-surface-border">
                    <Detail icon="👤" label="Capacidad" value={`${space.capacity} personas`} />
                    <Detail icon="📍" label="Edificio" value={space.building} />
                    <Detail icon="🏷️" label="Tipo" value={space.type.charAt(0).toUpperCase() + space.type.slice(1)} />
                </div>

                {/* Recursos */}
                <div className="mt-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Recursos disponibles:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {space.resources.map(r => (
                            <span key={r} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">{r}</span>
                        ))}
                    </div>
                </div>

                {/* Programas */}
                {space.allowedPrograms.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs font-medium text-gray-600 mb-2">Programas con acceso prioritario:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {space.allowedPrograms.map(p => (
                                <span key={p} className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs">{p}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botón reservar */}
                <div className="mt-6">
                    <button onClick={() => navigate(`/reservar/${space.id}`)} className="btn-primary">
                        Reservar este espacio
                    </button>
                </div>
            </div>

            {/* Próximas reservas */}
            <div className="card p-5">
                <h2 className="font-display font-bold text-base text-gray-900 mb-4">
                    Próximas reservas aprobadas
                </h2>
                {upcomingRes.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                        No hay reservas próximas — ¡disponible!
                    </p>
                ) : (
                    <div className="space-y-2">
                        {upcomingRes.map(r => (
                            <div key={r.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                                <span className="text-sm text-gray-700">{r.date}</span>
                                <span className="text-sm font-medium text-gray-900">{r.startTime} – {r.endTime}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function Detail({ icon, label, value }) {
    return (
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{icon} {label}</p>
            <p className="text-sm font-medium text-gray-800">{value}</p>
        </div>
    )
}
