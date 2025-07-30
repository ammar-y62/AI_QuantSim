import { api } from './api'

// Types for authentication
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Auth API service functions
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials)
    const { user, token } = response.data

    // Store token in localStorage
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(user))

    return response.data
  },

  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data)
    const { user, token } = response.data

    // Store token in localStorage
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(user))

    return response.data
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post('/auth/refresh')
    const { token } = response.data

    localStorage.setItem('authToken', token)
    return response.data
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken')
  },

  // Get stored user data
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('authToken')
  }
}

export default authService