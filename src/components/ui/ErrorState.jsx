export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="font-display font-bold text-lg text-gray-800 mb-1">
        Algo salió mal
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mb-5">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Reintentar
        </button>
      )}
    </div>
  )
}