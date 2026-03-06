import { useApp } from '../../context/AppContext'

const STYLES = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-gray-800 text-white',
}
const ICONS = { success: '✓', error: '✕', info: 'ℹ' }

export default function Notification() {
  const { state, dispatch } = useApp()
  if (!state.notification) return null

  return (
    <div className="fixed top-5 right-5 z-50 animate-slide-up max-w-sm">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-modal text-sm font-medium ${STYLES[state.notification.type]}`}>
        <span className="text-base leading-none mt-0.5">{ICONS[state.notification.type]}</span>
        <span className="flex-1">{state.notification.message}</span>
        <button onClick={() => dispatch({ type: 'CLEAR_NOTIFICATION' })} className="opacity-70 hover:opacity-100 transition-opacity">✕</button>
      </div>
    </div>
  )
}