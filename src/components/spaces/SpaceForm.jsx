import { useState } from 'react'
import { SPACE_TYPES, RESOURCES_LIST } from '../../data/mockData'

const EMPTY_FORM = {
    nombre: '',
    tipo: 'sala',
    capacidad: '',
    edificio: '',
    descripcion: '',
    requiere_aprobacion: false,
    recursos: [],
    programas_prioritarios: [],
}

export default function SpaceForm({ initial, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM)
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
            recursos: f.recursos.includes(r)
                ? f.recursos.filter(x => x !== r)
                : [...f.recursos, r],
        }))
    }

    const addProgram = () => {
        const trimmed = program.trim()
        if (!trimmed || form.programas_prioritarios.includes(trimmed)) return
        setForm(f => ({ ...f, programas_prioritarios: [...f.programas_prioritarios, trimmed] }))
        setProgram('')
    }

    const removeProgram = (p) => {
        setForm(f => ({ ...f, programas_prioritarios: f.programas_prioritarios.filter(x => x !== p) }))
    }

    const validate = () => {
        const e = {}
        if (!form.nombre?.trim() || form.nombre.trim().length < 3)
            e.nombre = 'El nombre debe tener al menos 3 caracteres.'
        if (!form.capacidad || parseInt(form.capacidad) < 1)
            e.capacidad = 'La capacidad debe ser mayor a 0.'
        if (!form.edificio?.trim())
            e.edificio = 'El edificio es requerido.'
        if (!form.descripcion?.trim())
            e.descripcion = 'La descripción es requerida.'
        return e
    }

    const handleSubmit = (ev) => {
        ev.preventDefault()
        const e = validate()
        if (Object.keys(e).length) return setErrors(e)
        onSubmit({
            nombre: form.nombre,
            tipo: form.tipo,
            capacidad: parseInt(form.capacidad),
            edificio: form.edificio,
            descripcion: form.descripcion,
            recursos: form.recursos,
            programas_prioritarios: form.programas_prioritarios,
            requiere_aprobacion: form.requiere_aprobacion,
        })
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sp-name">Nombre *</label>
                <input id="sp-name" type="text" placeholder="Ej: Laboratorio de Cómputo B"
                    value={form.nombre} onChange={set('nombre')}
                    className={`input-field ${errors.nombre ? 'input-error' : ''}`} />
                {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sp-type">Tipo *</label>
                    <select id="sp-type" value={form.tipo} onChange={set('tipo')} className="input-field">
                        {SPACE_TYPES.map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sp-capacity">Capacidad *</label>
                    <input id="sp-capacity" type="number" min={1} placeholder="Ej: 30"
                        value={form.capacidad} onChange={set('capacidad')}
                        className={`input-field ${errors.capacidad ? 'input-error' : ''}`} />
                    {errors.capacidad && <p className="text-xs text-red-600 mt-1">{errors.capacidad}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sp-building">Edificio *</label>
                <input id="sp-building" type="text" placeholder="Ej: Bloque 7"
                    value={form.edificio} onChange={set('edificio')}
                    className={`input-field ${errors.edificio ? 'input-error' : ''}`} />
                {errors.edificio && <p className="text-xs text-red-600 mt-1">{errors.edificio}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sp-desc">Descripción *</label>
                <textarea id="sp-desc" rows={2} placeholder="Describe brevemente el espacio..."
                    value={form.descripcion} onChange={set('descripcion')}
                    className={`input-field resize-none ${errors.descripcion ? 'input-error' : ''}`} />
                {errors.descripcion && <p className="text-xs text-red-600 mt-1">{errors.descripcion}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recursos disponibles</label>
                <div className="flex flex-wrap gap-2">
                    {RESOURCES_LIST.map(r => (
                        <button key={r} type="button" onClick={() => toggleResource(r)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${form.recursos.includes(r)
                                ? 'bg-brand-600 text-white border-brand-600'
                                : 'bg-white text-gray-600 border-surface-border hover:border-brand-400'
                                }`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>

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
                    <button type="button" onClick={addProgram} className="btn-secondary px-3">+ Agregar</button>
                </div>
                {form.programas_prioritarios.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {form.programas_prioritarios.map(p => (
                            <span key={p} className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs">
                                {p}
                                <button type="button" onClick={() => removeProgram(p)} className="hover:text-brand-900 font-bold">×</button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.requiere_aprobacion}
                    onChange={set('requiere_aprobacion')}
                    className="w-4 h-4 rounded border-surface-border text-brand-600 focus:ring-brand-500" />
                <span className="text-sm text-gray-700">Requiere aprobación del administrador</span>
            </label>

            <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar espacio'}
                </button>
                <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
            </div>
        </form>
    )
}
