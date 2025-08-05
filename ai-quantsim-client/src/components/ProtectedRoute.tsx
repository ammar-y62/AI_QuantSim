import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true
}) => {
  const { isAuthenticated, isLoading, isGuest } = useAuthStore();
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect to dashboard if user is authenticated and tries to access login/register
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute