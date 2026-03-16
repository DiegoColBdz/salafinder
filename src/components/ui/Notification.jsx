import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

const CONFIG = {
    success: { bg: 'bg-emerald-600', icon: '✓', label: 'Éxito' },
    error: { bg: 'bg-red-600', icon: '✕', label: 'Error' },
    info: { bg: 'bg-gray-800', icon: 'ℹ', label: 'Info' },
}

export default function Notification() {
    const { state, dispatch } = useApp()
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        if (!state.notification) { setProgress(100); return }
        setProgress(100)
        const interval = setInterval(() => {
            setProgress(p => Math.max(0, p - 2.5))
        }, 100)
        return () => clearInterval(interval)
    }, [state.notification])

    if (!state.notification) return null

    const { type, message } = state.notification
    const config = CONFIG[type] || CONFIG.info

    return (
        <div className="fixed top-5 right-5 z-50 animate-slide-up max-w-sm w-full">
            <div className={`relative overflow-hidden rounded-xl shadow-modal text-white ${config.bg}`}>
                <div className="flex items-start gap-3 px-4 py-3">
                    <span
                        className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        aria-label={config.label}
                    >
                        {config.icon}
                    </span>
                    <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
                    <button
                        onClick={() => dispatch({ type: 'CLEAR_NOTIFICATION' })}
                        aria-label="Cerrar notificación"
                        className="opacity-70 hover:opacity-100 transition-opacity text-sm leading-none mt-0.5 focus:outline-none focus:ring-1 focus:ring-white rounded"
                    >
                        ✕
                    </button>
                </div>

                <div className="h-1 bg-white/20">
                    <div
                        className="h-full bg-white/60 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
