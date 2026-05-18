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

        case 'LOGOUT': {
            localStorage.removeItem('sf_user')
            return { ...state, currentUser: null, notification: null }
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
