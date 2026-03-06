import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Notification from './components/ui/Notification'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

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
        {/* Temporal hasta tener las demás páginas */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}