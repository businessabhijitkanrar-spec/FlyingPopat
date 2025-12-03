import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { auth, db, isFirebaseConfigured } from '../firebase-config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  onSnapshot
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  allUsers: User[];
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, countryCode: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- MOCK / LOCAL STORAGE INITIALIZATION ---
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Load user from localStorage if exists
      const storedUser = localStorage.getItem('user');
      const sessionUser = sessionStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
      else if (sessionUser) setUser(JSON.parse(sessionUser));
      
      // Load all users for admin mock
      const storedAllUsers = localStorage.getItem('vastra_all_users');
      if (storedAllUsers) setAllUsers(JSON.parse(storedAllUsers));
      
      setIsLoading(false);
    }
  }, []);

  // --- FIREBASE INITIALIZATION ---
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    let unsubscribeProfile: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        unsubscribeProfile = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as User);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setIsLoading(false);
        });
      } else {
        setUser(null);
        setIsLoading(false);
        if (unsubscribeProfile) unsubscribeProfile();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // --- FIREBASE USERS LISTENER ---
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    let unsubscribeUsers: () => void;

    if (user?.role === 'admin') {
      const q = collection(db, "users");
      unsubscribeUsers = onSnapshot(q, (querySnapshot) => {
        const usersList: User[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push(doc.data() as User);
        });
        setAllUsers(usersList);
      });
    } else {
      setAllUsers([]);
    }

    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
    }
  }, [user?.role]);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
          // Special handling for the predefined admin account on a fresh database
          // If the user doesn't exist, we auto-create it to ensure the credentials provided work immediately.
          if (email === 'flyingpopat@gmail.com' && (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-login-credentials')) {
             try {
               console.log("Seeding admin account...");
               const userCredential = await createUserWithEmailAndPassword(auth, email, password);
               
               // Create Admin Profile
               const adminUser: User = {
                 id: userCredential.user.uid,
                 name: 'Vastra Admin',
                 email: email,
                 role: 'admin',
                 phone: '9999999999',
                 countryCode: '+91',
                 password: password, // Storing for the "show password" feature requested earlier
                 avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff',
                 joinedDate: new Date().toISOString().split('T')[0]
               };
               
               await setDoc(doc(db, "users", userCredential.user.uid), adminUser);
               console.log("Admin seeded successfully");
               return; // Success
             } catch (createErr) {
               // If create fails (e.g. maybe it exists but password was wrong?), throw original error
               console.error("Failed to seed admin:", createErr);
               throw error;
             }
          }
          throw error;
        }
      } else {
        // Mock Login
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Admin Bypass
        if (email === 'flyingpopat@gmail.com' && password === 'flyingpopat') {
           const adminUser: User = {
             id: 'admin-1',
             name: 'Vastra Admin',
             email: email,
             role: 'admin',
             avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff',
             password: password,
             joinedDate: new Date().toISOString()
           };
           setUser(adminUser);
           if (rememberMe) localStorage.setItem('user', JSON.stringify(adminUser));
           else sessionStorage.setItem('user', JSON.stringify(adminUser));
           return;
        }

        // Check local storage users
        const localUsers: User[] = JSON.parse(localStorage.getItem('vastra_all_users') || '[]');
        const foundUser = localUsers.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
           setUser(foundUser);
           if (rememberMe) localStorage.setItem('user', JSON.stringify(foundUser));
           else sessionStorage.setItem('user', JSON.stringify(foundUser));
        } else {
          throw new Error('Invalid credentials (Mock Mode)');
        }
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  };

  const register = async (name: string, email: string, password: string, phone: string, countryCode: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const newUser: User = {
        id: isFirebaseConfigured ? '' : Date.now().toString(), // Firebase will set ID if configured
        name,
        email,
        role,
        phone,
        countryCode,
        password: password,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        joinedDate: new Date().toISOString().split('T')[0]
      };

      if (isFirebaseConfigured && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        newUser.id = userCredential.user.uid;
        await setDoc(doc(db, "users", newUser.id), newUser);
      } else {
        // Mock Register
        await new Promise(resolve => setTimeout(resolve, 800));
        const localUsers: User[] = JSON.parse(localStorage.getItem('vastra_all_users') || '[]');
        const updatedUsers = [...localUsers, newUser];
        localStorage.setItem('vastra_all_users', JSON.stringify(updatedUsers));
        setAllUsers(updatedUsers);
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      } else {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};