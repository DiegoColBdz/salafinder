import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import SpaceCard from '../components/spaces/SpaceCard'
import { EmptyState } from '../components/ui/Index.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import { useFetch } from '../hooks/useFetch'
import { getSpaces } from '../services/api'
import { SPACE_TYPES } from '../data/mockData'

export default function SpacesPage() {
  const { dispatch } = useApp()
  const [filters, setFilters] = useState({ type: '', capacity: '', building: '', resource: '' })
  const [search, setSearch] = useState('')

  const { data: spaces, loading, error, setData } = useFetch(getSpaces, [])

  // Sincroniza los espacios del servidor con el Context
  useMemo(() => {
    if (spaces) dispatch({ type: 'SET_SPACES', payload: spaces })
  }, [spaces])

  const buildings = spaces ? [...new Set(spaces.map(s => s.building))] : []
  const resources = spaces ? [...new Set(spaces.flatMap(s => s.resources))] : []

  const filtered = useMemo(() => {
    if (!spaces) return []
    return spaces.filter(s => {
      if (filters.type && s.type !== filters.type) return false
      if (filters.capacity && s.capacity < parseInt(filters.capacity)) return false
      if (filters.building && s.building !== filters.building) return false
      if (filters.resource && !s.resources.includes(filters.resource)) return false
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
          !s.building.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [spaces, filters, search])

  const setFilter = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }))
  const clearFilters = () => { setFilters({ type: '', capacity: '', building: '', resource: '' }); setSearch('') }
  const hasFilters = Object.values(filters).some(Boolean) || search

  if (loading) return <LoadingSpinner message="Cargando espacios..." />
  if (error)   return <ErrorState message={error} onRetry={() => setData(null)} />

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Espacios disponibles</h1>
        <p className="text-gray-500 text-sm mt-1">Encuentra y reserva el espacio que necesitas</p>
      </div>

      <div className="card p-4 mb-6">
        <input type="search" placeholder="Buscar por nombre o edificio..."
          value={search} onChange={e => setSearch(e.target.value)} className="input-field mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select value={filters.type} onChange={setFilter('type')} className="input-field text-xs">
            <option value="">Tipo: Todos</option>
            {SPACE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select value={filters.capacity} onChange={setFilter('capacity')} className="input-field text-xs">
            <option value="">Capacidad: Cualquiera</option>
            <option value="5">5+ personas</option>
            <option value="10">10+ personas</option>
            <option value="20">20+ personas</option>
            <option value="50">50+ personas</option>
          </select>
          <select value={filters.building} onChange={setFilter('building')} className="input-field text-xs">
            <option value="">Edificio: Todos</option>
            {buildings.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filters.resource} onChange={setFilter('resource')} className="input-field text-xs">
            <option value="">Recurso: Todos</option>
            {resources.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="mt-2 text-xs text-brand-600 hover:underline font-medium">
            Limpiar filtros
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-4">
        {filtered.length} espacio{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Sin resultados"
          description="No hay espacios que coincidan con tus filtros."
          action={<button onClick={clearFilters} className="btn-secondary">Limpiar filtros</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(space => <SpaceCard key={space.id} space={space} />)}
        </div>
      )}
    </div>
  )
}