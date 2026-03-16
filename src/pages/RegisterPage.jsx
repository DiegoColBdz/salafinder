import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getUserByEmail, createUser } from '../services/api'

export default function RegisterPage() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 3)
      e.name = 'El nombre debe tener al menos 3 caracteres.'
    if (!form.email) e.email = 'El correo es requerido.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Ingresa un correo válido.'
    if (!form.password || form.password.length < 6)
      e.password = 'La contraseña debe tener al menos 6 caracteres.'
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden.'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    setLoading(true)
    setServerError('')
    try {
      // Verificar si el correo ya existe
      const existing = await getUserByEmail(form.email)
      if (existing) {
        setServerError('Ya existe una cuenta con ese correo.')
        return
      }
      const newUser = {
        id: `u-${Date.now()}`,
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        role: 'student',
        noShows: 0,
        blockedUntil: null,
      }
      const saved = await createUser(newUser)
      localStorage.setItem('sf_user', JSON.stringify(saved))
      dispatch({ type: 'LOGIN_SUCCESS', payload: saved })
      navigate('/espacios')
    } catch {
      setServerError('No se pudo conectar al servidor. Verifica que JSON Server esté corriendo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 to-brand-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="font-display font-bold text-2xl text-white">SF</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">SalaFinder</h1>
          <p className="text-brand-300 text-sm mt-1">Crea tu cuenta</p>
        </div>

        <div className="card p-7 shadow-modal">
          <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Registrarse</h2>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700 animate-slide-up">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {[
              { id: 'name',    label: 'Nombre completo',       type: 'text',     placeholder: 'Ana García',             field: 'name'            },
              { id: 'email',   label: 'Correo institucional',  type: 'email',    placeholder: 'usuario@uni.edu',        field: 'email'           },
              { id: 'pass',    label: 'Contraseña',            type: 'password', placeholder: 'Mínimo 6 caracteres',    field: 'password'        },
              { id: 'confirm', label: 'Confirmar contraseña',  type: 'password', placeholder: 'Repite tu contraseña',   field: 'confirmPassword' },
            ].map(f => (
              <div key={f.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor={f.id}>
                  {f.label}
                </label>
                <input id={f.id} type={f.type} placeholder={f.placeholder}
                  value={form[f.field]} onChange={set(f.field)}
                  className={`input-field ${errors[f.field] ? 'input-error' : ''}`} />
                {errors[f.field] && <p className="text-xs text-red-600 mt-1">{errors[f.field]}</p>}
              </div>
            ))}

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}