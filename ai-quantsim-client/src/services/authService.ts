// src/services/authService.ts
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "../firebaseConfig";
import { useAuthStore } from "../stores/authStore";

// Initialize Firebase app + auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const authService = {
  initAuthListener: () => {
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
    try {
      console.log('Starting Google login...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google login successful:', result.user.email);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  },
  logout: async () => {
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
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password);
  },

  registerWithEmail: async (email: string, password: string) => {
    const auth = getAuth();
    await createUserWithEmailAndPassword(auth, email, password);
  },
};
