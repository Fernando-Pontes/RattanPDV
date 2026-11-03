import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemUser } from '../types';
import { isFirebaseConfigured } from '../firebase';
import { seedDefaultUserIfEmpty, validateUserInFirestore } from '../services/firestore';

interface AuthContextType {
  currentUser: SystemUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameInput: string, passwordInput: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isFirebaseActive: boolean;
}

const AUTH_STORAGE_KEY = 'rattan_authenticated_user_v1';

// Default system user as requested
const DEFAULT_USER: SystemUser = {
  id: 'user_guilherme',
  name: 'Guilherme',
  username: 'guilherme',
  role: 'Administrador / Operador',
  active: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFirebaseActive = isFirebaseConfigured();

  // Load saved session on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SystemUser;
        if (parsed && parsed.username) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored user session:', e);
    } finally {
      setIsLoading(false);
    }

    // If Firebase is active, ensure the default user 'guilherme' exists in Firestore
    if (isFirebaseActive) {
      seedDefaultUserIfEmpty().catch(err => {
        console.warn('Background seed of default user failed:', err);
      });
    }
  }, [isFirebaseActive]);

  const login = async (
    usernameInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = usernameInput.trim();
    const cleanPass = passwordInput.trim();

    if (!cleanUser) {
      return { success: false, error: 'Por favor, informe o nome de usuário.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Por favor, informe a senha de acesso.' };
    }

    // 1. If Firebase is active, query Firestore 'users' collection
    if (isFirebaseActive) {
      try {
        const firestoreUser = await validateUserInFirestore(cleanUser, cleanPass);
        if (firestoreUser) {
          setCurrentUser(firestoreUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(firestoreUser));
          return { success: true };
        }
      } catch (err) {
        console.warn('Firestore user validation error, checking local fallback:', err);
      }
    }

    // 2. Built-in check for user "Guilherme" (supports username 'guilherme' with default passwords)
    const isGuilhermeUsername = cleanUser.toLowerCase() === 'guilherme';
    const isGuilhermePassword =
      cleanPass === '123456' ||
      cleanPass === 'rattan123' ||
      cleanPass.toLowerCase() === 'guilherme';

    if (isGuilhermeUsername && isGuilhermePassword) {
      setCurrentUser(DEFAULT_USER);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_USER));

      // Attempt to save to Firestore in background if configured
      if (isFirebaseActive) {
        seedDefaultUserIfEmpty().catch(() => {});
      }

      return { success: true };
    }

    return {
      success: false,
      error: 'Usuário ou senha incorretos. Verifique suas credenciais no Firebase ou use o operador padrão.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        isFirebaseActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
