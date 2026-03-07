import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useState } from 'react'

const ROLE_LABELS = { student: 'Estudiante', staff: 'Docente', admin: 'Administrador' }
const ROLE_COLORS = {
    student: 'bg-blue-100 text-blue-700',
    staff: 'bg-emerald-100 text-emerald-700',
    admin: 'bg-violet-100 text-violet-700'
}

export default function Layout() {
    const { state, dispatch } = useApp()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const user = state.currentUser

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' })
        navigate('/login')
    }

    const navItems = [
        { to: '/espacios', label: 'Espacios' },
        { to: '/mis-reservas', label: 'Mis Reservas' },
        ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Panel Admin', icon: '⚙️' }] : []),
    ]

    return (
        <div className="min-h-screen bg-surface flex flex-col">
            {/* Navbar */}
            <header className="bg-white border-b border-surface-border sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
                    {/* Logo */}
                    <NavLink to="/espacios" className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm">SF</span>
                        <span className="font-display font-bold text-lg text-gray-900 hidden sm:block">SalaFinder</span>
                    </NavLink>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <span className="mr-1.5">{item.icon}</span>{item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-900 leading-none">{user?.name}</span>
                            <span className={`badge mt-1 ${ROLE_COLORS[user?.role]}`}>{ROLE_LABELS[user?.role]}</span>
                        </div>
                        <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-2 hidden sm:flex">
                            Salir
                        </button>
                        {/* Mobile hamburger */}
                        <button onClick={() => setMobileOpen(v => !v)} className="md:hidden p-2 rounded-lg hover:bg-gray-50">
                            <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-surface-border bg-white px-4 py-3 space-y-1 animate-fade-in">
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'
                                    }`
                                }
                            >
                                <span>{item.icon}</span>{item.label}
                            </NavLink>
                        ))}
                        <div className="pt-2 border-t border-surface-border flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <span className={`badge ${ROLE_COLORS[user?.role]}`}>{ROLE_LABELS[user?.role]}</span>
                            </div>
                            <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-2">Salir</button>
                        </div>
                    </div>
                )}
            </header>

            {/* Contenido */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-surface-border bg-white py-4 text-center text-xs text-gray-400">
                SalaFinder © {new Date().getFullYear()} — Sistema de Reserva de Espacios
            </footer>
        </div>
    )
}
