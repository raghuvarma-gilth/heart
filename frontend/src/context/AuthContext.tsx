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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  // Track if login/signup already fetched userData to avoid double fetch
  const justAuthenticatedRef = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Skip Firestore fetch if login/signup already set userData
        if (justAuthenticatedRef.current) {
          justAuthenticatedRef.current = false;
          setLoading(false);
          return;
        }
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) setUserData(snap.data() as UserData);
        } catch (e) {
          console.error('Error fetching user data:', e);
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
    // Fetch user data immediately and set it - prevents double fetch
    try {
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      if (snap.exists()) {
        setUserData(snap.data() as UserData);
        justAuthenticatedRef.current = true;
      }
    } catch (err) {
      console.warn('Firestore offline or failed to fetch immediately during login', err);
      // Fallback: onAuthStateChanged will handle the state update
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
    await setDoc(doc(db, 'users', cred.user.uid), data);
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
