import { createContext, useContext, useReducer, useEffect } from 'react'
import { SPACES, RESERVATIONS_INITIAL, USERS_INITIAL } from '../data/mockData'

function getInitialState() {
    const storedUser = localStorage.getItem('sf_user')
    const storedReservations = localStorage.getItem('sf_reservations')
    const storedUsers = localStorage.getItem('sf_users')
    return {
        currentUser: storedUser ? JSON.parse(storedUser) : null,
        users: storedUsers ? JSON.parse(storedUsers) : USERS_INITIAL,
        spaces: SPACES,
        reservations: storedReservations ? JSON.parse(storedReservations) : RESERVATIONS_INITIAL,
        notification: null,
    }
}

function appReducer(state, action) {
    switch (action.type) {

        case 'LOGIN_SUCCESS': {
            localStorage.setItem('sf_user', JSON.stringify(action.payload))
            return {
                ...state,
                currentUser: action.payload,
                notification: { type: 'success', message: `Bienvenido, ${action.payload.name}!` }
            }
        }

        case 'REGISTER': {
            const exists = state.users.find(u => u.email === action.payload.email)
            if (exists) return { ...state, notification: { type: 'error', message: 'Ya existe una cuenta con ese correo.' } }
            const newUser = { id: `u-${Date.now()}`, ...action.payload, role: 'student', noShows: 0, blockedUntil: null }
            const updatedUsers = [...state.users, newUser]
            localStorage.setItem('sf_users', JSON.stringify(updatedUsers))
            localStorage.setItem('sf_user', JSON.stringify(newUser))
            return { ...state, users: updatedUsers, currentUser: newUser, notification: { type: 'success', message: '¡Cuenta creada con éxito!' } }
        }

        case 'LOGOUT': {
            localStorage.removeItem('sf_user')
            return { ...state, currentUser: null, notification: null }
        }

        case 'ADD_RESERVATION': {
            const { spaceId, date, startTime, endTime } = action.payload
            const conflict = state.reservations.find(r =>
                r.spaceId === spaceId && r.date === date && r.status === 'approved' &&
                startTime < r.endTime && endTime > r.startTime
            )
            if (conflict) return { ...state, notification: { type: 'error', message: `Conflicto: el espacio ya está reservado de ${conflict.startTime} a ${conflict.endTime}.` } }
            const space = state.spaces.find(s => s.id === spaceId)
            const newRes = { id: `res-${Date.now()}`, ...action.payload, userId: state.currentUser.id, status: space.requiresApproval ? 'pending' : 'approved', createdAt: new Date().toISOString() }
            const updatedRes = [...state.reservations, newRes]
            localStorage.setItem('sf_reservations', JSON.stringify(updatedRes))
            const msg = space.requiresApproval ? 'Reserva enviada, pendiente de aprobación.' : 'Espacio reservado exitosamente.'
            return { ...state, reservations: updatedRes, notification: { type: 'success', message: msg } }
        }

        case 'CANCEL_RESERVATION': {
        const updated = state.reservations.map(r =>
            r.id === action.payload ? { ...r, estado: 'Cancelado' } : r
        )
        return { ...state, reservations: updated }
        }

        case 'APPROVE_RESERVATION': {
        const updated = state.reservations.map(r =>
            r.id === action.payload ? { ...r, estado: 'Aprobado' } : r
        )
        return { ...state, reservations: updated }
        }

        case 'REJECT_RESERVATION': {
        const updated = state.reservations.map(r =>
            r.id === action.payload ? { ...r, estado: 'Rechazado' } : r
        )
        return { ...state, reservations: updated }
        }

        case 'CLEAR_NOTIFICATION':
            return { ...state, notification: null }

        case 'SET_SPACES':
            return { ...state, spaces: action.payload }

        case 'SET_RESERVATIONS':
            return { ...state, reservations: action.payload }

        case 'ADD_RESERVATION_SUCCESS': {
            const updated = [...state.reservations, action.payload]
            localStorage.setItem('sf_reservations', JSON.stringify(updated))
            const msg = action.payload.status === 'pending'
                ? 'Reserva enviada, pendiente de aprobaciÃ³n.'
                : 'Espacio reservado exitosamente.'
            return { ...state, reservations: updated, notification: { type: 'success', message: msg } }
        }

        case 'SET_NOTIFICATION':
            return { ...state, notification: action.payload }

        case 'ADD_SPACE': {
            return { ...state, spaces: [...state.spaces, action.payload] }
        }

        case 'UPDATE_SPACE': {
            const updated = state.spaces.map(s =>
                s.id === action.payload.id ? action.payload : s
            )
            return { ...state, spaces: updated }
        }

        case 'DELETE_SPACE': {
            const updated = state.spaces.filter(s => s.id !== action.payload)
            return { ...state, spaces: updated }
        }

        default:
            return state
    }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, undefined, getInitialState)

    useEffect(() => {
        if (state.notification) {
            const timer = setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 4000)
            return () => clearTimeout(timer)
        }
    }, [state.notification])

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useApp must be used inside AppProvider')
    return ctx
}
