export function StatusBadge({ status }) {
    const map = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-emerald-100 text-emerald-800',
        rejected: 'bg-red-100 text-red-800',
        cancelled: 'bg-gray-100 text-gray-600',
    }
    const labels = {
        pending: 'Pendiente',
        approved: 'Aprobada',
        rejected: 'Rechazada',
        cancelled: 'Cancelada',
    }
    return (
        <span className={`badge ${map[status] || 'bg-gray-100 text-gray-600'}`}>
            {labels[status] || status}
        </span >
    )
}

export function EmptyState({ icon = '📭', title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="font-display font-bold text-lg text-gray-800 mb-1">{title}</h3>
            {description && <p className="text-sm text-gray-500 max-w-xs">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    )
}

export function Spinner({ size = 'md' }) {
    const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
    return (
        <div className={`${sz[size]} border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin`} />
    )
}
