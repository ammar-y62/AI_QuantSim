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
const isFirebaseConfigured = firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'placeholder-api-key' &&
  firebaseConfig.apiKey !== ''

// Initialize Firebase only if properly configured
let app = null
let auth = null
let analytics = null
let googleProvider = null
let facebookProvider = null

if (isFirebaseConfigured) {
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

    console.log('Firebase initialized successfully')
  } catch (error) {
    console.error('Firebase initialization failed:', error)
    // Reset to null on error
    app = null
    auth = null
    analytics = null
    googleProvider = null
    facebookProvider = null
  }
} else {
  console.warn('Firebase is not configured. Authentication features will be disabled.')
  console.warn('To enable Firebase, set the following environment variables:')
  console.warn('- VITE_FIREBASE_API_KEY')
  console.warn('- VITE_FIREBASE_AUTH_DOMAIN')
  console.warn('- VITE_FIREBASE_PROJECT_ID')
  console.warn('- VITE_FIREBASE_STORAGE_BUCKET')
  console.warn('- VITE_FIREBASE_MESSAGING_SENDER_ID')
  console.warn('- VITE_FIREBASE_APP_ID')
}

export { auth, analytics, googleProvider, facebookProvider }
export default app