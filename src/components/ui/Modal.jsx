import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, footer }) {
    // Cerrar con Escape
    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    // Bloquear scroll del body
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md animate-slide-up">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-border">
                    <h2 id="modal-title" className="font-display font-bold text-lg text-gray-900">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar modal"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-6 py-5">
                    {children}
                </div>

                {footer && (
                    <div className="px-6 pb-6 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}
