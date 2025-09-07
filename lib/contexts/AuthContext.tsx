'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, convertToAuthUser, convertToAuthUserWithCustomVerification, AuthUser, getCurrentUser } from '../auth';
import { createUserDocument } from '../services/userCount';
import { isEmailVerified } from '../services/userVerification';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const authUser = await convertToAuthUserWithCustomVerification(currentUser);
      setUser(authUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user: User | null) => {
      if (user) {
        console.log('🔄 Auth state changed, user logged in:', user.email);
        const authUser = await convertToAuthUserWithCustomVerification(user);
        console.log('✅ AuthUser created:', authUser);
        setUser(authUser);
        setError(null);
        
        // Create user document in Firestore for user count
        try {
          const userData: {
            email: string
            displayName?: string
            photoURL?: string
          } = {
            email: user.email || ''
          };
          
          if (user.displayName) {
            userData.displayName = user.displayName;
          }
          
          if (user.photoURL) {
            userData.photoURL = user.photoURL;
          }
          
          await createUserDocument(user.uid, userData);
          console.log('User document created successfully');
        } catch (error) {
          console.error('Error creating user document:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    error,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
