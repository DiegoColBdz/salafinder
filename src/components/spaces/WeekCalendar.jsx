import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`)

const STATUS_COLORS = {
    Aprobado: 'bg-red-100 border-red-300 text-red-700',
    Pendiente: 'bg-yellow-100 border-yellow-300 text-yellow-700',
}

function getWeekDays(baseDate) {
    const days = []
    const start = new Date(baseDate)
    const day = start.getDay()
    const diff = day === 0 ? -6 : 1 - day
    start.setDate(start.getDate() + diff)
    for (let i = 0; i < 7; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        days.push(d)
    }
    return days
}

function toDateStr(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

export default function WeekCalendar({ spaceId, reservations }) {
    const navigate = useNavigate()
    const [baseDate, setBaseDate] = useState(new Date())
    const weekDays = getWeekDays(baseDate)
    const todayStr = toDateStr(new Date())
    const { state } = useApp()
    const isStudent = state.currentUser?.role?.toLowerCase() === "student"

    const prevWeek = () => {
        const d = new Date(baseDate)
        d.setDate(d.getDate() - 7)
        setBaseDate(d)
    }

    const nextWeek = () => {
        const d = new Date(baseDate)
        d.setDate(d.getDate() + 7)
        setBaseDate(d)
    }

    const goToday = () => setBaseDate(new Date())

    // Reservas activas del espacio
    const activeRes = reservations.filter(r =>
        r.id_espacio === spaceId &&
        (r.estado === 'Aprobado' || r.estado === 'Pendiente')
    )

    const getResForCell = (dayStr, hour) => {
        const cellStart = timeToMinutes(hour)
        const cellEnd = cellStart + 60
        return activeRes.filter(r => {
            if (r.fecha !== dayStr) return false
            const resStart = timeToMinutes(r.hora_inicio)
            const resEnd = timeToMinutes(r.hora_fin)
            return resStart < cellEnd && resEnd > cellStart
        })
    }

    const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

    return (
        <div>
            {/* Navegación de semana */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={prevWeek} className="btn-secondary px-3 py-2 text-xs">← Anterior</button>
                    <button onClick={goToday} className="btn-secondary px-3 py-2 text-xs">Hoy</button>
                    <button onClick={nextWeek} className="btn-secondary px-3 py-2 text-xs">Siguiente →</button>
                </div>
                <p className="text-sm font-medium text-gray-700">
                    {weekDays[0].getDate()} {MONTHS[weekDays[0].getMonth()]} —{' '}
                    {weekDays[6].getDate()} {MONTHS[weekDays[6].getMonth()]} {weekDays[6].getFullYear()}
                </p>
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-red-200 border border-red-300 inline-block" />
                    Aprobada
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300 inline-block" />
                    Pendiente
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                    Disponible
                </span>
            </div>

            {/* Grid del calendario */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-surface-border">
                                {/* Columna de horas */}
                                <th className="w-14 px-2 py-3 text-gray-400 font-medium text-right border-r border-surface-border">
                                    Hora
                                </th>
                                {weekDays.map((day, i) => {
                                    const dayStr = toDateStr(day)
                                    const isToday = dayStr === todayStr
                                    return (
                                        <th key={i} className={`px-2 py-3 text-center font-medium min-w-[90px] ${isToday ? 'bg-brand-50 text-brand-700' : 'text-gray-600'
                                            }`}>
                                            <div>{DAY_NAMES[i]}</div>
                                            <div className={`text-lg font-bold ${isToday ? 'text-brand-600' : 'text-gray-800'}`}>
                                                {day.getDate()}
                                            </div>
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {HOURS.map(hour => (
                                <tr key={hour} className="border-b border-surface-border last:border-0">
                                    {/* Etiqueta de hora */}
                                    <td className="px-2 py-1 text-right text-gray-400 font-mono border-r border-surface-border align-top pt-2">
                                        {hour}
                                    </td>
                                    {weekDays.map((day, i) => {
                                        const dayStr = toDateStr(day)
                                        const cellRes = getResForCell(dayStr, hour)
                                        const isToday = dayStr === todayStr
                                        const isPast = dayStr < todayStr
                                        return (
                                            <td key={i}
                                                className={`px-1 py-1 h-10 align-top border-r border-surface-border last:border-0 ${isToday ? 'bg-brand-50/30' : isPast ? 'bg-gray-50/50' : ''
                                                    }`}
                                            >
                                                {cellRes.length > 0 ? (
                                                    cellRes.map(r => (
                                                        <div key={r.id}
                                                            className={`rounded border px-1.5 py-0.5 text-xs leading-tight truncate cursor-default ${STATUS_COLORS[r.estado]}`}
                                                            title={`${r.hora_inicio?.slice(0, 5)}–${r.hora_fin?.slice(0, 5)} · ${r.proposito}`}
                                                        >
                                                            {r.hora_inicio?.slice(0, 5)}–{r.hora_fin?.slice(0, 5)}
                                                        </div>
                                                    ))
                                                ) : !isPast && !isStudent ? (
                                                    <button
                                                        onClick={() => navigate(`/reservar/${spaceId}`)}
                                                        className="w-full h-full rounded hover:bg-emerald-50 hover:border hover:border-emerald-200 transition-colors group"
                                                        title="Disponible — clic para reservar"
                                                        aria-label={`Disponible el ${dayStr} a las ${hour}`}
                                                    >
                                                        <span className="hidden group-hover:block text-emerald-600 text-center text-xs">+</span>
                                                    </button>
                                                ) : null}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
