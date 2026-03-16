import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { StatusBadge, EmptyState } from '../components/ui/Index.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getReservations, updateReservation, getUsers } from '../services/api'

export default function AdminPage() {
  const { state, dispatch } = useApp()
  const [tab, setTab]           = useState('pending')
  const [loading, setLoading]   = useState(true)
  const [users, setUsers]       = useState([])

  // se Cargan reservas y usuarios desde el servidor
  useEffect(() => {
    Promise.all([getReservations(), getUsers()])
      .then(([reservations, fetchedUsers]) => {
        dispatch({ type: 'SET_RESERVATIONS', payload: reservations })
        setUsers(fetchedUsers)
      })
      .catch(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Error al cargar los datos.' } })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAction = async (id, status) => {
    try {
      await updateReservation(id, { status })
      dispatch({ type: status === 'approved' ? 'APPROVE_RESERVATION' : 'REJECT_RESERVATION', payload: id })
    } catch {
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Error al actualizar la reserva.' } })
    }
  }

  const reservations = state.reservations
    .filter(r => tab === 'all' || r.status === tab)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const stats = {
    pending:  state.reservations.filter(r => r.status === 'pending').length,
    approved: state.reservations.filter(r => r.status === 'approved').length,
    total:    state.reservations.length,
  }

  if (loading) return <LoadingSpinner message="Cargando panel..." />

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Panel Administrador</h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona todas las reservas del sistema</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: 'Pendientes', value: stats.pending,  color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Aprobadas',  value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total',      value: stats.total,    color: 'text-brand-600',   bg: 'bg-brand-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 border-0 ${s.bg}`}>
            <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-5">
        {[
          { key: 'pending',  label: 'Pendientes' },
          { key: 'approved', label: 'Aprobadas'  },
          { key: 'all',      label: 'Todas'       },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {reservations.length === 0 ? (
        <EmptyState icon="✓" title="Sin reservas" description="No hay reservas en este estado." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-surface-border">
                  {['Espacio', 'Usuario', 'Rol', 'Fecha', 'Horario', 'Propósito', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {reservations.map(r => {
                  const space = state.spaces.find(s => s.id === r.spaceId)
                  const user  = users.find(u => u.id === r.userId)
                  const ROLE_COLORS = {
                    student: 'bg-blue-100 text-blue-700',
                    staff:   'bg-emerald-100 text-emerald-700',
                    admin:   'bg-violet-100 text-violet-700',
                  }
                  const ROLE_LABELS = { student: 'Estudiante', staff: 'Docente', admin: 'Admin' }
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap max-w-[140px] truncate">
                        {space?.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user?.name}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${ROLE_COLORS[user?.role]}`}>
                          {ROLE_LABELS[user?.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.date}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.startTime} – {r.endTime}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{r.purpose}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        {r.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleAction(r.id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors">
                              Aprobar
                            </button>
                            <button onClick={() => handleAction(r.id, 'rejected')}
                              className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors">
                              Rechazar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}