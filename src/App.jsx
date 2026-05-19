import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Notification from './components/ui/Notification'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SpacesPage from './pages/SpacesPage'
import SpaceDetailPage from './pages/SpaceDetailPage'
import NewReservationPage from './pages/NewReservationPage'
import MyReservationsPage from './pages/MyReservationsPage'
import AdminPage from './pages/AdminPage'
import CalendarPage from './pages/CalendarPage'
import StaffPage from './pages/StaffPage'

function PrivateRoute({ children }) {
    const { state } = useApp()
    return state.currentUser ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
    const { state } = useApp()
    if (!state.currentUser) return <Navigate to="/login" replace />
    if (state.currentUser.role !== 'admin') return <Navigate to="/espacios" replace />
    return children
}

function GuestRoute({ children }) {
    const { state } = useApp()
    return !state.currentUser ? children : <Navigate to="/espacios" replace />
}

function StudentRoute({ children }) {
    const { state } = useApp()
    if (!state.currentUser) return <Navigate to="/login" replace />
    if (state.currentUser.role === 'admin') return <Navigate to="/espacios" replace />
    return children
}

function StaffRoute({ children }) {
  const { state } = useApp()
  if (!state.currentUser) return <Navigate to="/login" replace />
  if (state.currentUser.role.toLowerCase() !== 'staff')
    return <Navigate to="/espacios" replace />
  return children
}

export default function App() {
    return (
        <>
            <Notification />
            <Routes>
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/registro" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route index element={<Navigate to="/espacios" replace />} />
                    <Route path="/espacios" element={<SpacesPage />} />
                    <Route path="/espacios/:id" element={<SpaceDetailPage />} />
                    <Route path="/reservar/:id" element={<StudentRoute><NewReservationPage /></StudentRoute>} />
                    <Route path="/mis-reservas" element={<StudentRoute><MyReservationsPage /></StudentRoute>} />
                    <Route path="/calendario" element={<CalendarPage />} />
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                    <Route path="/staff" element={<StaffRoute><StaffPage /></StaffRoute>} />
                </Route>
                <Route path="*" element={<Navigate to="/espacios" replace />} />
            </Routes>
        </>
    )
}
