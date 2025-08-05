import { authService } from '@/services/authService'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from "@/stores/authStore";


const Login: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Login component - auth state changed:', { isAuthenticated, isLoading });
    if (isAuthenticated) {
      console.log("Already authenticated — redirecting to dashboard...");
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  console.log('Login component rendering...', { isAuthenticated, isLoading })

  const handleGuestLogin = () => {
    console.log('Guest login clicked - navigating to dashboard')
    useAuthStore.getState().setIsGuest(true);
    navigate('/dashboard')
  }

  const handleGoogleLogin = async () => {
    try {
      console.log('Google login button clicked');
      setIsGoogleLoading(true);
      await authService.loginWithGoogle();
      console.log('Google login completed');
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI QuantSim
          </h1>
          <p className="text-gray-600 mt-2">Advanced Portfolio Analytics & AI Insights</p>
        </div>

        {/* Simple Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Welcome Back</h2>
          <p className="text-gray-600 text-center mb-6">
            Sign in to access your portfolio analytics and AI insights
          </p>

          <div className="space-y-4">
            <button
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Email/Password Login Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const email = form.email.value;
                const password = form.password.value;
                try {
                  await authService.loginWithEmail(email, password);
                  navigate("/dashboard");
                } catch (err: any) {
                  alert(err.message);
                }
              }}
              className="space-y-4"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
              >
                Sign in with Email
              </button>
            </form>

            {/* Guest Login Button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              onClick={handleGuestLogin}
            >
              🚀 Login as Guest (Development)
            </button>

            <div className="text-center text-sm text-gray-600">
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Debug Panel - Remove in production */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <div>isAuthenticated: {isAuthenticated.toString()}</div>
            <div>isLoading: {isLoading.toString()}</div>
            <div>isGoogleLoading: {isGoogleLoading.toString()}</div>
          </div>
        )} */}

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">What you'll get:</h3>
          <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
            <div className="flex items-center justify-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              AI-powered portfolio analysis
            </div>
            <div className="flex items-center justify-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Real-time market insights
            </div>
            <div className="flex items-center justify-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Advanced risk metrics
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login