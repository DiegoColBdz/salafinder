import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { StatusBadge, EmptyState } from '../components/ui/Index.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import SpaceForm from '../components/spaces/SpaceForm'
import {
  getReservations, updateReservation,
  getUsers, getSpaces,
  createSpace, updateSpace, deleteSpace,
} from '../services/api'

const TABS = ['reservas', 'espacios', 'usuarios']
const TAB_LABELS = { reservas: '📅 Reservas', espacios: '🏢 Espacios', usuarios: '👥 Usuarios' }

export default function AdminPage() {
  const { state, dispatch } = useApp()
  const [tab, setTab]             = useState('reservas')
  const [resTab, setResTab]       = useState('pending')
  const [loading, setLoading]     = useState(true)
  const [users, setUsers]         = useState([])
  const [formLoading, setFormLoading] = useState(false)

  // Modales
  const [showCreate, setShowCreate]   = useState(false)
  const [editSpace, setEditSpace]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    Promise.all([getReservations(), getUsers(), getSpaces()])
      .then(([reservations, fetchedUsers, spaces]) => {
        dispatch({ type: 'SET_RESERVATIONS', payload: reservations })
        dispatch({ type: 'SET_SPACES', payload: spaces })
        setUsers(fetchedUsers)
      })
      .catch(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Error al cargar los datos.' } })
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Reservas ────────────────────────────────────────────────────────────────
  const handleReservationAction = async (id, status) => {
    try {
      await updateReservation(id, { status })
      dispatch({ type: status === 'approved' ? 'APPROVE_RESERVATION' : 'REJECT_RESERVATION', payload: id })
    } catch {
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Error al actualizar la reserva.' } })
    }
  }

  // ── Espacios ────────────────────────────────────────────────────────────────
  const handleCreateSpace = async (data) => {
    setFormLoading(true)
    try {
      const newSpace = { ...data, id: `sp-${Date.now()}` }
      const saved = await createSpace(newSpace)
      dispatch({ type: 'ADD_SPACE', payload: saved })
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'success', message: 'Espacio creado exitosamente.' } })
      setShowCreate(false)
    } catch {
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Error al crear el espacio.' } })
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditSpace = async (data) => {
    setFormLoading(true)
    try {
      const saved = await updateSpace(editSpace.id, data)
      dispatch({ type: 'UPDATE_SPACE', payload: saved })
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'success', message: 'Espacio actualizado.' } })
      setEditSpace(null)
    } catch {
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Error al actualizar el espacio.' } })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteSpace = async () => {
    try {
      await deleteSpace(deleteTarget.id)
      dispatch({ type: 'DELETE_SPACE', payload: deleteTarget.id })
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'info', message: 'Espacio eliminado.' } })
      setDeleteTarget(null)
    } catch {
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Error al eliminar el espacio.' } })
    }
  }

  const reservations = state.reservations
    .filter(r => resTab === 'all' || r.status === resTab)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const stats = {
    pending:  state.reservations.filter(r => r.status === 'pending').length,
    approved: state.reservations.filter(r => r.status === 'approved').length,
    total:    state.reservations.length,
  }

  const ROLE_COLORS = {
    student: 'bg-blue-100 text-blue-700',
    staff:   'bg-emerald-100 text-emerald-700',
    admin:   'bg-violet-100 text-violet-700',
  }
  const ROLE_LABELS = { student: 'Estudiante', staff: 'Docente', admin: 'Admin' }

  if (loading) return <LoadingSpinner message="Cargando panel..." />

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Panel Administrador</h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona reservas, espacios y usuarios</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: 'Pendientes', value: stats.pending,       color: 'text-yellow-600',  bg: 'bg-yellow-50'  },
          { label: 'Aprobadas',  value: stats.approved,      color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Espacios',   value: state.spaces.length, color: 'text-brand-600',   bg: 'bg-brand-50'   },
        ].map(s => (
          <div key={s.label} className={`card p-4 border-0 ${s.bg}`}>
            <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs principales */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── TAB: RESERVAS ── */}
      {tab === 'reservas' && (
        <>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-5">
            {[
              { key: 'pending',  label: 'Pendientes' },
              { key: 'approved', label: 'Aprobadas'  },
              { key: 'all',      label: 'Todas'       },
            ].map(t => (
              <button key={t.key} onClick={() => setResTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  resTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {reservations.length === 0 ? (
            <EmptyState icon="✅" title="Sin reservas" description="No hay reservas en este estado." />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-surface-border">
                      {['Espacio', 'Usuario', 'Rol', 'Fecha', 'Horario', 'Estado', 'Acciones'].map(h => (
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
                      return (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap max-w-[140px] truncate">{space?.name}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user?.name}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${ROLE_COLORS[user?.role]}`}>{ROLE_LABELS[user?.role]}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.date}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.startTime} – {r.endTime}</td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-3">
                            {r.status === 'pending' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleReservationAction(r.id, 'approved')}
                                  className="px-2.5 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors">
                                  Aprobar
                                </button>
                                <button onClick={() => handleReservationAction(r.id, 'rejected')}
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
        </>
      )}

      {/* ── TAB: ESPACIOS ── */}
      {tab === 'espacios' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              + Crear espacio
            </button>
          </div>

          {state.spaces.length === 0 ? (
            <EmptyState icon="🏢" title="Sin espacios"
              description="No hay espacios registrados."
              action={<button onClick={() => setShowCreate(true)} className="btn-primary">Crear espacio</button>}
            />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-surface-border">
                      {['Nombre', 'Tipo', 'Capacidad', 'Edificio', 'Aprobación', 'Acciones'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {state.spaces.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">{s.name}</td>
                        <td className="px-4 py-3 text-gray-600 capitalize">{s.type}</td>
                        <td className="px-4 py-3 text-gray-600">{s.capacity}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.building}</td>
                        <td className="px-4 py-3">
                          {s.requiresApproval
                            ? <span className="badge bg-amber-100 text-amber-700">Sí</span>
                            : <span className="badge bg-gray-100 text-gray-600">No</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setEditSpace(s)}
                              className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-lg hover:bg-brand-100 transition-colors">
                              Editar
                            </button>
                            <button onClick={() => setDeleteTarget(s)}
                              className="px-2.5 py-1 bg-red-50 text-red-700 text-xs rounded-lg hover:bg-red-100 transition-colors">
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB: USUARIOS ── */}
      {tab === 'usuarios' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-surface-border">
                  {['Nombre', 'Correo', 'Rol', 'No-shows', 'Estado', 'Reservas activas'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map(u => {
                  const activeRes = state.reservations.filter(
                    r => r.userId === u.id && ['pending', 'approved'].includes(r.status)
                  ).length
                  const isBlocked = u.blockedUntil && new Date() < new Date(u.blockedUntil)
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-medium ${u.noShows >= 2 ? 'text-red-600' : 'text-gray-700'}`}>
                          {u.noShows}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isBlocked
                          ? <span className="badge bg-red-100 text-red-700">Bloqueado</span>
                          : <span className="badge bg-emerald-100 text-emerald-700">Activo</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">{activeRes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: Crear espacio ── */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Crear nuevo espacio">
        <SpaceForm
          onSubmit={handleCreateSpace}
          onCancel={() => setShowCreate(false)}
          loading={formLoading}
        />
      </Modal>

      {/* ── MODAL: Editar espacio ── */}
      <Modal isOpen={!!editSpace} onClose={() => setEditSpace(null)} title="Editar espacio">
        {editSpace && (
          <SpaceForm
            initial={editSpace}
            onSubmit={handleEditSpace}
            onCancel={() => setEditSpace(null)}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* ── MODAL: Confirmar eliminar ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSpace}
        title="Eliminar espacio"
        message={`¿Estás seguro de que deseas eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer y eliminará el espacio del sistema.`}
        confirmLabel="Sí, eliminar"
        danger
      />
    </div>
  )
}