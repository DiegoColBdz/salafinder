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

    case 'LOGIN': {
      const user = state.users.find(
        u => u.email === action.payload.email && u.password === action.payload.password
      )
      if (!user) return { ...state, notification: { type: 'error', message: 'Correo o contraseña incorrectos.' } }
      localStorage.setItem('sf_user', JSON.stringify(user))
      return { ...state, currentUser: user, notification: { type: 'success', message: `Bienvenido, ${user.name}!` } }
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
      const updated = state.reservations.map(r => r.id === action.payload ? { ...r, status: 'cancelled' } : r)
      localStorage.setItem('sf_reservations', JSON.stringify(updated))
      return { ...state, reservations: updated, notification: { type: 'info', message: 'Reserva cancelada.' } }
    }

    case 'APPROVE_RESERVATION': {
      const updated = state.reservations.map(r => r.id === action.payload ? { ...r, status: 'approved' } : r)
      localStorage.setItem('sf_reservations', JSON.stringify(updated))
      return { ...state, reservations: updated, notification: { type: 'success', message: 'Reserva aprobada.' } }
    }

    case 'REJECT_RESERVATION': {
      const updated = state.reservations.map(r => r.id === action.payload ? { ...r, status: 'rejected' } : r)
      localStorage.setItem('sf_reservations', JSON.stringify(updated))
      return { ...state, reservations: updated, notification: { type: 'info', message: 'Reserva rechazada.' } }
    }

    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null }

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