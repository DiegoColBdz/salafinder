const ROLE_CONFIG = {
  student: { label: 'Estudiante', color: 'bg-blue-100 text-blue-700' },
  staff:   { label: 'Docente',    color: 'bg-emerald-100 text-emerald-700' },
  admin:   { label: 'Administrador', color: 'bg-violet-100 text-violet-700' },
}

export default function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || { label: role, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`badge ${config.color}`}>
      {config.label}
    </span>
  )
}