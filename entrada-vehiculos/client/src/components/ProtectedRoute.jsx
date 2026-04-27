import { Navigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('token')
  const timerRef = useRef(null)

  const resetTimer = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      sessionStorage.removeItem('token')
      window.location.href = '/cellfrio-web/login'
    }, 20 * 60 * 1000) // 20 minutos
  }

  useEffect(() => {
    if (!token) return

    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    eventos.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      eventos.forEach(e => window.removeEventListener(e, resetTimer))
      clearTimeout(timerRef.current)
    }
  }, [token])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}