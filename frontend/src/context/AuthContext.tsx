'use client';
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'patient' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
const googleProvider = new GoogleAuthProvider();

// Firestore fetch with 5s timeout — never hangs
function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);
}

// Fallback when Firestore is unreachable
function fallback(u: User): UserData {
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
  const justAuthRef = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (justAuthRef.current) {
          justAuthRef.current = false;
          setLoading(false);
          return;
        }
        try {
          const snap = await withTimeout(getDoc(doc(db, 'users', u.uid)));
          setUserData(snap.exists() ? (snap.data() as UserData) : fallback(u));
        } catch {
          setUserData(fallback(u));
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
      const snap = await withTimeout(getDoc(doc(db, 'users', cred.user.uid)));
      setUserData(snap.exists() ? (snap.data() as UserData) : fallback(cred.user));
    } catch {
      setUserData(fallback(cred.user));
    }
    justAuthRef.current = true;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    try {
      const snap = await withTimeout(getDoc(doc(db, 'users', cred.user.uid)));
      if (snap.exists()) {
        setUserData(snap.data() as UserData);
      } else {
        // First-time Google user — create Firestore doc
        const data: UserData = {
          uid: cred.user.uid,
          name: cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
          email: cred.user.email || '',
          role: 'patient',
          createdAt: serverTimestamp(),
        };
        await withTimeout(setDoc(doc(db, 'users', cred.user.uid), data)).catch(() => {});
        setUserData(data);
      }
    } catch {
      setUserData(fallback(cred.user));
    }
    justAuthRef.current = true;
  };

  const signup = async (email: string, password: string, name: string, role: 'patient' | 'admin') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const data: UserData = { uid: cred.user.uid, name, email, role, createdAt: serverTimestamp() };
    await withTimeout(setDoc(doc(db, 'users', cred.user.uid), data)).catch(() => {});
    setUserData(data);
    justAuthRef.current = true;
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, loginWithGoogle, signup, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
