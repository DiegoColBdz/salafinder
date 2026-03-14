export default function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}