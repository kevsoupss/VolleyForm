import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase/firebase'
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth'

// Auth object structure
interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
  }
  
  // creates the auth context that components that use this context will have access to its values, initialized as null
  const AuthContext = createContext<AuthContextType | null>(null);
  
  // allows components to access auth state from the authcontext above, and will return an error if not wrapped inside AuthProvider
  export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  }
  
  // main provider component, which manages auth state and wraps the other components of the app to give them auth context
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      // on authstatechanged is a firebase function that listens for a change in auth state
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
  
      return unsubscribe;
    }, []);
  
    async function signInWithGoogle() {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
      }
    }
    async function logout() {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    }
  
    const value = {
      currentUser,
      loading,
      signInWithGoogle,
      logout
    };
  
    return (
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    );
  } 