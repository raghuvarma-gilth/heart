'use client';
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface UserData {
  uid: string;
  name: string;
  email: string;
  role: 'patient' | 'admin';
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'patient' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Helper: fetch with timeout so Firestore never hangs forever
function fetchWithTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms))
  ]);
}

// Build fallback userData from Firebase Auth user when Firestore is unavailable
function fallbackUserData(u: User): UserData {
  return {
    uid: u.uid,
    name: u.displayName || u.email?.split('@')[0] || 'User',
    email: u.email || '',
    role: 'patient',
    createdAt: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const justAuthenticatedRef = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (justAuthenticatedRef.current) {
          justAuthenticatedRef.current = false;
          setLoading(false);
          return;
        }
        try {
          const snap = await fetchWithTimeout(getDoc(doc(db, 'users', u.uid)));
          if (snap.exists()) {
            setUserData(snap.data() as UserData);
          } else {
            // User exists in Auth but not Firestore — use fallback
            setUserData(fallbackUserData(u));
          }
        } catch (e) {
          console.warn('Firestore fetch failed, using fallback user data:', e);
          setUserData(fallbackUserData(u));
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    try {
      const snap = await fetchWithTimeout(getDoc(doc(db, 'users', cred.user.uid)));
      if (snap.exists()) {
        setUserData(snap.data() as UserData);
      } else {
        setUserData(fallbackUserData(cred.user));
      }
      justAuthenticatedRef.current = true;
    } catch (err) {
      console.warn('Firestore fetch failed during login, using fallback:', err);
      setUserData(fallbackUserData(cred.user));
      justAuthenticatedRef.current = true;
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'patient' | 'admin') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const data: UserData = {
      uid: cred.user.uid,
      name,
      email,
      role,
      createdAt: serverTimestamp(),
    };
    try {
      await fetchWithTimeout(setDoc(doc(db, 'users', cred.user.uid), data));
    } catch (err) {
      console.warn('Firestore write failed during signup:', err);
    }
    setUserData(data);
    justAuthenticatedRef.current = true;
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, signup, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
