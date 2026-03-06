import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'El correo es requerido.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Ingresa un correo válido.'
    if (!form.password) e.password = 'La contraseña es requerida.'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    dispatch({ type: 'LOGIN', payload: form })
    setLoading(false)
    navigate('/espacios')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 to-brand-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="font-display font-bold text-2xl text-white">SF</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">SalaFinder</h1>
          <p className="text-brand-300 text-sm mt-1">Reserva de espacios universitarios</p>
        </div>

        <div className="card p-7 shadow-modal">
          <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Iniciar sesión</h2>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Correo institucional</label>
              <input id="email" type="email" placeholder="usuario@uni.edu" value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })) }}
                className={`input-field ${errors.email ? 'input-error' : ''}`} />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Contraseña</label>
              <input id="password" type="password" placeholder="••••••••" value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })) }}
                className={`input-field ${errors.password ? 'input-error' : ''}`} />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-brand-600 font-medium hover:underline">Regístrate aquí</Link>
          </p>
        </div>

        {/* Cuentas de prueba */}
        <div className="mt-4 card p-4 bg-white/5 border-white/10">
          <p className="text-xs text-brand-300 font-medium mb-2">Cuentas de prueba:</p>
          {[
            { label: 'Estudiante', email: 'ana.garcia@uni.edu', pw: '123456' },
            { label: 'Docente', email: 'carlos.mora@uni.edu', pw: '123456' },
            { label: 'Admin', email: 'admin@uni.edu', pw: 'admin123' },
          ].map(u => (
            <button key={u.email} type="button"
              onClick={() => setForm({ email: u.email, password: u.pw })}
              className="block w-full text-left text-xs text-brand-200 hover:text-white transition-colors py-0.5">
              <span className="font-medium">{u.label}:</span> {u.email} / {u.pw}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}