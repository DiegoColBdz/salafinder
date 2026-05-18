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
    cambiarRol,
} from '../services/api'

const TABS = ['reservas', 'espacios', 'usuarios']
const TAB_LABELS = { reservas: '📅 Reservas', espacios: '🏢 Espacios', usuarios: '👥 Usuarios' }

const ROLE_COLORS = {
    Student: 'bg-blue-100 text-blue-700',
    Staff: 'bg-emerald-100 text-emerald-700',
    Admin: 'bg-violet-100 text-violet-700',
}
const ROLE_LABELS = { Student: 'Estudiante', Staff: 'Docente', Admin: 'Admin' }

const ESTADO_MAP = {
    Pendiente: 'pending',
    Aprobado: 'approved',
    Rechazado: 'rejected',
    Cancelado: 'cancelled',
}

export default function AdminPage() {
    const { state, dispatch } = useApp()
    const [tab, setTab] = useState('reservas')
    const [resTab, setResTab] = useState('Pendiente')
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [formLoading, setFormLoading] = useState(false)

    const [showCreate, setShowCreate] = useState(false)
    const [editSpace, setEditSpace] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [roleChangeTarget, setRoleChangeTarget] = useState(null)

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

    // -- Cambiar Rol ----------------------------------------------------------
    // Abre el modal de confirmación
    const askCambiarRol = (user, nuevoRol) => {
        console.log('askCambiarRol llamado', user, nuevoRol)
        setRoleChangeTarget({ user, nuevoRol })
    }

    // Ejecuta el cambio (llamado por el modal al confirmar)
    const handleCambiarRol = async () => {
        if (!roleChangeTarget) return
        const { user, nuevoRol } = roleChangeTarget
        try {
            await cambiarRol(user.id, nuevoRol)
            setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, rol: nuevoRol } : u
            ))
            dispatch({
                type: 'SET_NOTIFICATION',
                payload: { type: 'success', message: `Rol de ${user.nombre_completo} actualizado a ${nuevoRol}.` }
            })
        } catch (err) {
            dispatch({
                type: 'SET_NOTIFICATION',
                payload: { type: 'error', message: err.message || 'Error al cambiar el rol.' }
            })
        } finally {
            setRoleChangeTarget(null)
        }
    }

    // ── Reservas ──────────────────────────────────────────────────────────────
    const handleReservationAction = async (id, nuevoEstado) => {
        try {
            await updateReservation(id, { estado: nuevoEstado })
            dispatch({
                type: nuevoEstado === 'Aprobado' ? 'APPROVE_RESERVATION' : 'REJECT_RESERVATION',
                payload: id
            })
            dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'success', message: `Reserva ${nuevoEstado.toLowerCase()}.` } })
        } catch {
            dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Error al actualizar la reserva.' } })
        }
    }

    // ── Espacios ──────────────────────────────────────────────────────────────
    const handleCreateSpace = async (data) => {
        setFormLoading(true)
        try {
            await createSpace(data)
            const fresh = await getSpaces()
            dispatch({ type: 'SET_SPACES', payload: fresh })
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
        } catch (err) {
            dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: err.message } })
        }
    }

    // Filtrar reservas según el tab usando campos del backend
    const reservations = state.reservations
        .filter(r => resTab === 'all' || r.estado === resTab)
        .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))

    const stats = {
        pending: state.reservations.filter(r => r.estado === 'Pendiente').length,
        approved: state.reservations.filter(r => r.estado === 'Aprobado').length,
        total: state.reservations.length,
    }

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
                    { label: 'Pendientes', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Aprobadas', value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Espacios', value: state.spaces.length, color: 'text-brand-600', bg: 'bg-brand-50' },
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
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                            }`}>
                        {TAB_LABELS[t]}
                    </button>
                ))}
            </div>

            {/* ── TAB: RESERVAS ── */}
            {/* ── TAB: RESERVAS ── */}
            {tab === 'reservas' && (
                <>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-5">
                        {[
                            { key: 'Pendiente', label: 'Pendientes' },
                            { key: 'Aprobado', label: 'Aprobadas' },
                            { key: 'all', label: 'Todas' },
                        ].map(t => (
                            <button key={t.key} onClick={() => setResTab(t.key)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${resTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
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
                                            {['Espacio', 'Usuario', 'Fecha', 'Horario', 'Asistentes', 'Estado', 'Acciones'].map(h => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-border">
                                        {reservations.map(r => {
                                            const space = state.spaces.find(s => s.id === r.id_espacio)
                                            return (
                                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap max-w-[140px] truncate">
                                                        {space?.nombre ?? r.espacio?.nombre ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                        {r.usuario?.nombre_completo ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.fecha}</td>
                                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                        {r.hora_inicio?.slice(0, 5)} – {r.hora_fin?.slice(0, 5)}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 text-center">{r.asistentes}</td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status={ESTADO_MAP[r.estado] ?? 'pending'} />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {r.estado === 'Pendiente' && (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleReservationAction(r.id, 'Aprobado')}
                                                                    className="px-2.5 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors">
                                                                    Aprobar
                                                                </button>
                                                                <button onClick={() => handleReservationAction(r.id, 'Rechazado')}
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
                                                <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">{s.nombre}</td>
                                                <td className="px-4 py-3 text-gray-600 capitalize">{s.tipo}</td>
                                                <td className="px-4 py-3 text-gray-600">{s.capacidad}</td>
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.edificio}</td>
                                                <td className="px-4 py-3">
                                                    {s.requiere_aprobacion
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
                                    {['Nombre', 'Correo', 'Rol', 'No-shows', 'Estado', 'Acciones'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {users.map(u => {
                                    const isBlocked = u.bloqueado_hasta && new Date() < new Date(u.bloqueado_hasta)
                                    const isAdminRow = u.rol === 'Admin'
                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{u.nombre_completo}</td>
                                            <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`badge ${ROLE_COLORS[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {ROLE_LABELS[u.rol] ?? u.rol}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-medium ${u.no_shows >= 2 ? 'text-red-600' : 'text-gray-700'}`}>
                                                    {u.no_shows}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {isBlocked
                                                    ? <span className="badge bg-red-100 text-red-700">Bloqueado</span>
                                                    : <span className="badge bg-emerald-100 text-emerald-700">Activo</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3">
                                                {isAdminRow ? (
                                                    <span className="text-xs text-gray-400 italic">—</span>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        {u.rol !== 'Student' && (
                                                            <button
                                                                onClick={() => askCambiarRol(u, 'Student')}
                                                                className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg hover:bg-blue-100 transition-colors"
                                                            >
                                                                → Estudiante
                                                            </button>
                                                        )}
                                                        {u.rol !== 'Staff' && (
                                                            <button
                                                                onClick={() => askCambiarRol(u, 'Staff')}
                                                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg hover:bg-emerald-100 transition-colors"
                                                            >
                                                                → Docente
                                                            </button>
                                                        )}
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
                message={`¿Estás seguro de que deseas eliminar "${deleteTarget?.nombre}"?`}
                confirmLabel="Sí, eliminar"
                danger
            />

            <ConfirmModal
                isOpen={!!roleChangeTarget}
                onClose={() => setRoleChangeTarget(null)}
                onConfirm={handleCambiarRol}
                title="Cambiar rol de usuario"
                message={
                    roleChangeTarget
                        ? `¿Estás seguro de cambiar el rol de "${roleChangeTarget.user.nombre_completo}" de ${ROLE_LABELS[roleChangeTarget.user.rol] ?? roleChangeTarget.user.rol} a ${ROLE_LABELS[roleChangeTarget.nuevoRol] ?? roleChangeTarget.nuevoRol}?`
                        : ''
                }
                confirmLabel="Sí, cambiar rol"
                cancelLabel="Cancelar"
            />
        </div>
    )
}
