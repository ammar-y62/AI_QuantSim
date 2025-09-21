// src/services/authService.ts
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useAuthStore } from "../stores/authStore";
import { api } from "./api";

export const authService = {
  initAuthListener: () => {
    if (!auth) {
      console.warn('Firebase auth is not available. Auth features disabled.');
      const set = useAuthStore.getState();
      set.setIsAuthenticated(false);
      set.setUser(null);
      set.setIsLoading(false);
      return;
    }

    console.log('Initializing auth listener...');
    const set = useAuthStore.getState();
    onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      if (user) {
        // Get ID token and send to backend for verification
        try {
          const idToken = await user.getIdToken();
          const response = await api.post('/auth/login', { idToken });
          console.log('Backend login successful:', response.data);
          set.setIsAuthenticated(true);
          set.setUser(user);
        } catch (error) {
          console.error('Backend login failed:', error);
          // Still set as authenticated for frontend, but backend might not recognize
          set.setIsAuthenticated(true);
          set.setUser(user);
        }
      } else {
        set.setIsAuthenticated(false);
        set.setUser(null);
      }
      set.setIsLoading(false);
    });
  },
  
  loginWithGoogle: async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase authentication is not configured. Please set up Firebase environment variables.');
    }

    try {
      console.log('Starting Google login...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google login successful:', result.user.email);
      
      // Get ID token and send to backend
      const idToken = await result.user.getIdToken();
      const response = await api.post('/auth/login', { idToken });
      console.log('Backend login successful:', response.data);
      
      return result;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  },
  
  logout: async () => {
    if (!auth) {
      console.warn('Firebase auth is not available. Resetting local state only.');
      const set = useAuthStore.getState();
      set.setIsAuthenticated(false);
      set.setIsLoading(false);
      return;
    }

    try {
      console.log('Logging out from Firebase...');
      await signOut(auth);
      console.log('Firebase logout successful');

      // Reset auth store state
      const set = useAuthStore.getState();
      set.setIsAuthenticated(false);
      set.setIsLoading(false);
      set.setUser(null);
      console.log('Auth store state reset');
    } catch (error) {
      console.error('Firebase logout failed:', error);
      throw error;
    }
  },
  
  loginWithEmail: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Get ID token and send to backend
      const idToken = await result.user.getIdToken();
      const response = await api.post('/auth/login', { idToken });
      console.log('Backend login successful:', response.data);
      return result;
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    }
  },

  registerWithEmail: async (email: string, password: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Get ID token and send to backend
      const idToken = await result.user.getIdToken();
      const response = await api.post('/auth/register', { 
        idToken,
        displayName: displayName || email.split('@')[0]
      });
      console.log('Backend registration successful:', response.data);
      return result;
    } catch (error) {
      console.error('Email registration failed:', error);
      throw error;
    }
  },
};
