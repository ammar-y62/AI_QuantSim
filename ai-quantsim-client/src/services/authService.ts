// src/services/authService.ts
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useAuthStore } from "../stores/authStore";

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
    onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      set.setIsAuthenticated(!!user);
      set.setUser(user);
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
      console.log('Auth store state reset');
    } catch (error) {
      console.error('Firebase logout failed:', error);
      throw error;
    }
  },
  loginWithEmail: async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase authentication is not configured.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  },

  registerWithEmail: async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase authentication is not configured.');
    }
    await createUserWithEmailAndPassword(auth, email, password);
  },
};
