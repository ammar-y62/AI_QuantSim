import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

// Your Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'placeholder-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'placeholder-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'placeholder-app-id',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'placeholder-measurement-id'
}

// Check if Firebase config is properly set up
const isFirebaseConfigured = firebaseConfig.apiKey !== 'placeholder-api-key'

if (!isFirebaseConfigured) {
  console.warn('Firebase is not properly configured. Please set up your Firebase environment variables.')
}

// Initialize Firebase
let app
let auth
let analytics
let googleProvider
let facebookProvider

try {
  app = initializeApp(firebaseConfig)

  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app)

  // Initialize Analytics (only in browser environment)
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app)
    } catch (error) {
      console.warn('Analytics initialization failed:', error)
    }
  }

  // Auth providers
  googleProvider = new GoogleAuthProvider()
  facebookProvider = new FacebookAuthProvider()

  // Configure Google provider
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  })

  // Configure Facebook provider
  facebookProvider.setCustomParameters({
    display: 'popup'
  })
} catch (error) {
  console.error('Firebase initialization failed:', error)
  // Create fallback objects to prevent crashes
  auth = null
  analytics = null
  googleProvider = null
  facebookProvider = null
}

export { auth, analytics, googleProvider, facebookProvider }
export default app