import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ReservationCard from '../components/reservations/ReservationCard'
import { EmptyState } from '../components/ui/index.jsx'

const TABS = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'approved', label: 'Aprobadas' },
    { key: 'cancelled', label: 'Canceladas' },
]

export default function MyReservationsPage() {
    const { state } = useApp()
    const navigate = useNavigate()
    const [tab, setTab] = useState('all')

    const myRes = state.reservations
        .filter(r => r.userId === state.currentUser.id)
        .filter(r => tab === 'all' || r.status === tab)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const countByTab = (key) => key === 'all'
        ? state.reservations.filter(r => r.userId === state.currentUser.id).length
        : state.reservations.filter(r => r.userId === state.currentUser.id && r.status === key).length

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display font-bold text-2xl text-gray-900">Mis Reservas</h1>
                    <p className="text-gray-500 text-sm mt-1">Gestiona tus reservas de espacios</p>
                </div>
                <button onClick={() => navigate('/espacios')} className="btn-primary">
                    + Nueva reserva
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
                {TABS.map(t => {
                    const count = countByTab(t.key)
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {t.label}
                            {count > 0 && (
                                <span className="ml-1.5 text-xs opacity-60">({count})</span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Cards */}
            {myRes.length === 0 ? (
                <EmptyState
                    icon=""
                    title="Sin reservas"
                    description={
                        tab === 'all'
                            ? 'Aún no has hecho ninguna reserva.'
                            : `No tienes reservas ${tab === 'pending' ? 'pendientes' :
                                tab === 'approved' ? 'aprobadas' : 'canceladas'
                            }.`
                    }
                    action={
                        tab === 'all' && (
                            <button onClick={() => navigate('/espacios')} className="btn-primary">
                                Buscar espacios
                            </button>
                        )
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myRes.map(r => <ReservationCard key={r.id} reservation={r} />)}
                </div>
            )}
        </div>
    )
}
