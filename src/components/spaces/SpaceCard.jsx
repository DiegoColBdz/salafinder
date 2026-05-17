import { useNavigate } from 'react-router-dom'

const TYPE_ICONS = { laboratorio: '💻', sala: '🚪', cancha: '⚽', auditorio: '🎭' }
const TYPE_COLORS = {
  laboratorio: 'bg-blue-50 text-blue-700',
  sala:        'bg-emerald-50 text-emerald-700',
  cancha:      'bg-orange-50 text-orange-700',
  auditorio:   'bg-purple-50 text-purple-700',
}

export default function SpaceCard({ space }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/espacios/${space.id}`)}
      className="card p-5 cursor-pointer hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={`badge ${TYPE_COLORS[space.tipo] || 'bg-gray-50 text-gray-700'}`}>
          <span className="mr-1">{TYPE_ICONS[space.tipo]}</span>
          {space.tipo?.charAt(0).toUpperCase() + space.tipo?.slice(1)}
        </span>
        {space.requiere_aprobacion && (
          <span className="badge bg-amber-50 text-amber-700">Requiere aprobación</span>
        )}
      </div>

      {/* Nombre */}
      <h3 className="font-display font-bold text-gray-900 text-base mb-1 leading-tight">
        {space.nombre}
      </h3>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{space.descripcion}</p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-surface-border pt-3">
        <span className="flex items-center gap-1">
          <span>👤</span>
          <span>Cap. {space.capacidad}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>📍</span>
          <span>{space.edificio}</span>
        </span>
      </div>

      {/* Recursos */}
      {space.recursos?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {space.recursos.slice(0, 3).map(r => (
            <span key={r} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{r}</span>
          ))}
          {space.recursos.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
              +{space.recursos.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}