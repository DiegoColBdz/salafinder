import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Notification from './components/ui/Notification'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SpacesPage from './pages/SpacesPage'

function PrivateRoute({ children }) {
    const { state } = useApp()
    return state.currentUser ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
    const { state } = useApp()
    return !state.currentUser ? children : <Navigate to="/espacios" replace />
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
                </Route>
                <Route path="*" element={<Navigate to="/espacios" replace />} />
            </Routes>
        </>
    )
}
