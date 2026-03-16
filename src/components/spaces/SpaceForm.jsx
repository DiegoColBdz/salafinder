import { useState } from 'react'
import { SPACE_TYPES, RESOURCES_LIST } from '../../data/mockData'

const EMPTY_FORM = {
  name: '', type: 'sala', capacity: '', building: '',
  description: '', requiresApproval: false,
  resources: [], allowedPrograms: [],
}

export default function SpaceForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading }) {
  const [form, setForm]   = useState(initial)
  const [errors, setErrors] = useState({})
  const [program, setProgram] = useState('')

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [field]: val }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  const toggleResource = (r) => {
    setForm(f => ({
      ...f,
      resources: f.resources.includes(r)
        ? f.resources.filter(x => x !== r)
        : [...f.resources, r],
    }))
  }

  const addProgram = () => {
    const trimmed = program.trim()
    if (!trimmed || form.allowedPrograms.includes(trimmed)) return
    setForm(f => ({ ...f, allowedPrograms: [...f.allowedPrograms, trimmed] }))
    setProgram('')
  }

  const removeProgram = (p) => {
    setForm(f => ({ ...f, allowedPrograms: f.allowedPrograms.filter(x => x !== p) }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 3)
      e.name = 'El nombre debe tener al menos 3 caracteres.'
    if (!form.capacity || parseInt(form.capacity) < 1)
      e.capacity = 'La capacidad debe ser mayor a 0.'
    if (!form.building.trim())
      e.building = 'El edificio es requerido.'
    if (!form.description.trim())
      e.description = 'La descripción es requerida.'
    return e
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    onSubmit({ ...form, capacity: parseInt(form.capacity) })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sp-name">
          Nombre *
        </label>
        <input id="sp-name" type="text" placeholder="Ej: Laboratorio de Cómputo B"
          value={form.name} onChange={set('name')}
          className={`input-field ${errors.name ? 'input-error' : ''}`} />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* Tipo y Capacidad */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sp-type">
            Tipo *
          </label>
          <select id="sp-type" value={form.type} onChange={set('type')} className="input-field">
            {SPACE_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sp-capacity">
            Capacidad *
          </label>
          <input id="sp-capacity" type="number" min={1} placeholder="Ej: 30"
            value={form.capacity} onChange={set('capacity')}
            className={`input-field ${errors.capacity ? 'input-error' : ''}`} />
          {errors.capacity && <p className="text-xs text-red-600 mt-1">{errors.capacity}</p>}
        </div>
      </div>

      {/* Edificio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sp-building">
          Edificio *
        </label>
        <input id="sp-building" type="text" placeholder="Ej: Bloque 7"
          value={form.building} onChange={set('building')}
          className={`input-field ${errors.building ? 'input-error' : ''}`} />
        {errors.building && <p className="text-xs text-red-600 mt-1">{errors.building}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sp-desc">
          Descripción *
        </label>
        <textarea id="sp-desc" rows={2} placeholder="Describe brevemente el espacio..."
          value={form.description} onChange={set('description')}
          className={`input-field resize-none ${errors.description ? 'input-error' : ''}`} />
        {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
      </div>

      {/* Recursos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Recursos disponibles</label>
        <div className="flex flex-wrap gap-2">
          {RESOURCES_LIST.map(r => (
            <button key={r} type="button" onClick={() => toggleResource(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                form.resources.includes(r)
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-surface-border hover:border-brand-400'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Programas permitidos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Programas con acceso prioritario
          <span className="text-gray-400 font-normal ml-1">(opcional)</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input type="text" placeholder="Ej: Ingeniería de Sistemas"
            value={program} onChange={e => setProgram(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addProgram() } }}
            className="input-field flex-1" />
          <button type="button" onClick={addProgram} className="btn-secondary px-3">
            + Agregar
          </button>
        </div>
        {form.allowedPrograms.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.allowedPrograms.map(p => (
              <span key={p} className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs">
                {p}
                <button type="button" onClick={() => removeProgram(p)}
                  className="hover:text-brand-900 font-bold">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Requiere aprobación */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.requiresApproval}
          onChange={set('requiresApproval')}
          className="w-4 h-4 rounded border-surface-border text-brand-600 focus:ring-brand-500" />
        <span className="text-sm text-gray-700">Requiere aprobación del administrador</span>
      </label>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar espacio'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
      </div>

    </form>
  )
}