import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/index.jsx'
import { getStudents, registrarNoShow } from '../services/api'

export default function StaffPage() {
  const { dispatch } = useApp()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    getStudents()
      .then(data => setUsers(data))
      .catch(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Error al cargar estudiantes.' } })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleNoShow = async (usuarioId) => {
    try {
      await registrarNoShow(usuarioId)
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'success', message: 'No-show registrado exitosamente.' }
      })
      // Recargar usuarios para reflejar cambios
      const updated = await getStudents()
      setUsers(updated)
    } catch (err) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { type: 'error', message: err.message }
      })
    }
  }

  const filtered = users.filter(u =>
    u.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const ROLE_COLORS = {
    Student: 'bg-blue-100 text-blue-700',
    Staff:   'bg-emerald-100 text-emerald-700',
    Admin:   'bg-violet-100 text-violet-700',
  }
  const ROLE_LABELS = {
    Student: 'Estudiante',
    Staff:   'Docente',
    Admin:   'Admin',
  }

  if (loading) return <LoadingSpinner message="Cargando usuarios..." />

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Panel Staff</h1>
        <p className="text-gray-500 text-sm mt-1">
          Registra no-shows de estudiantes que no asistieron a su reserva
        </p>
      </div>

      {/* Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl"></span>
          <div>
            <p className="font-display font-bold text-amber-800 text-sm">
              ¿Cuándo registrar un no-show?
            </p>
            <p className="text-amber-700 text-xs mt-1">
              Registra un no-show cuando un estudiante no se presentó a su reserva aprobada.
              Al acumular <strong>2 no-shows</strong> el estudiante queda bloqueado
              por <strong>7 días</strong> y el contador se resetea a 0.
            </p>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="card p-4 mb-6">
        <input
          type="search"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Sin usuarios"
          description="No hay usuarios que coincidan con la búsqueda."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-surface-border">
                  {['Nombre', 'Correo', 'Rol', 'No-shows', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filtered.map(u => {
                  const isBlocked = u.bloqueado_hasta &&
                    new Date() < new Date(u.bloqueado_hasta)

                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {u.nombre_completo}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${ROLE_COLORS[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>
                          {ROLE_LABELS[u.rol] ?? u.rol}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${u.no_shows >= 1 ? 'text-amber-600' : 'text-gray-500'}`}>
                          {u.no_shows}/2
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isBlocked ? (
                          <div>
                            <span className="badge bg-red-100 text-red-700">Bloqueado</span>
                            <p className="text-xs text-red-500 mt-0.5">
                              Hasta: {new Date(u.bloqueado_hasta).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span className="badge bg-emerald-100 text-emerald-700">Activo</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleNoShow(u.id)}
                          disabled={isBlocked}
                          title={isBlocked
                            ? 'Usuario ya bloqueado'
                            : 'Registrar no-show'
                          }
                          className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          + No-show
                        </button>
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