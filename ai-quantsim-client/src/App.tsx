import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { authService } from './services/authService'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './pages/Register'
import GlobalAIAssistant from './components/GlobalAIAssistant'
import { useAuthStore } from './stores/authStore'

import './App.css'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const location = useLocation()

  // Debug logging
  console.log('App render - isInitialized:', isInitialized)

  // Initialize auth listener and app
  useEffect(() => {
    console.log('App initializing...')

    // Initialize Firebase auth listener
    authService.initAuthListener()

    setTimeout(() => {
      setIsInitialized(true)
      console.log('App initialized')
    }, 100)
  }, [])

  // If not initialized yet, show a simple loading
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Initializing...</p>
        </div>
      </div>
    )
  }

  console.log('Rendering routes...')

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      {/* Global AI Assistant - show when on dashboard page */}
      {location.pathname === '/dashboard' && <GlobalAIAssistant />}
    </>
  )
}

export default App

