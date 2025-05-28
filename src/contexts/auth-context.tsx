
"use client";
import type { User, ShippingAddress, WithdrawalMethod } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock-data';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

// Define a type for the result of signInWithGoogle to indicate if phone number is needed
export type GoogleSignInResult = {
  user: User | null;
  needsPhoneNumber?: boolean;
  googleEmail?: string; // Email from Google to link if phone number is provided later
  error?: string;
};

interface AuthContextType {
  currentUser: User | null;
  login: (identifier: string, pass: string, loginType: 'email' | 'phone') => Promise<User | null>;
  logout: () => void;
  register: (name: string, phoneNumber: string, password: string, email?: string) => Promise<User | null>;
  updateCurrentUserData: (updatedData: Partial<Pick<User, 'name' | 'email' | 'phoneNumber' | 'defaultShippingAddress' | 'withdrawalMethods' | 'isAwaitingPhoneNumber' | 'googleEmail'>>) => void;
  signInWithGoogle: () => Promise<GoogleSignInResult | null>;
  completeGoogleSignInWithPhoneNumber: (googleEmail: string, phoneNumber: string) => Promise<User | null>;
  clearPendingGoogleUser: () => void;
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  updatePhoneNumber: (newPhoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  pendingGoogleUserEmail: string | null; // Store email of user needing phone number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Google User for simulation
const MOCK_GOOGLE_USER = {
  email: 'new.googleuser@example.com',
  name: 'Google User New',
  // No phone number initially
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [loading, setLoading] = useState(true);
  const [pendingGoogleUserEmail, setPendingGoogleUserEmail] = useLocalStorage<string | null>('pendingGoogleUserEmail', null);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (identifier: string, _pass: string, loginType: 'email' | 'phone'): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    let userFromMock: User | undefined;

    if (loginType === 'email') {
      userFromMock = MOCK_USERS.find(u => u.email?.toLowerCase() === identifier.toLowerCase());
    } else {
      userFromMock = MOCK_USERS.find(u => u.phoneNumber === identifier);
    }

    if (userFromMock) {
      const userToStore: User = {
        ...userFromMock,
        defaultShippingAddress: userFromMock.defaultShippingAddress || null,
        withdrawalMethods: userFromMock.withdrawalMethods || [],
      };
      setCurrentUser(userToStore);
      setLoading(false);
      return userToStore;
    }
    setLoading(false);
    return null;
  };

  const register = async (name: string, phoneNumber: string, _pass: string, email?: string): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const existingUserByPhone = MOCK_USERS.find(u => u.phoneNumber === phoneNumber);
    if (existingUserByPhone) {
      setLoading(false);
      return null; 
    }
    if (email) {
      const existingUserByEmail = MOCK_USERS.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (existingUserByEmail) {
        setLoading(false);
        return null;
      }
    }

    const newUser: User = {
      id: `user${MOCK_USERS.length + 1}-${Date.now()}`,
      phoneNumber,
      email: email || undefined,
      name,
      isAdmin: false,
      defaultShippingAddress: null,
      withdrawalMethods: []
    };
    MOCK_USERS.push(newUser); 
    setCurrentUser(newUser);
    setLoading(false);
    return newUser;
  };

  const signInWithGoogle = async (): Promise<GoogleSignInResult | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const googleProvidedEmail = MOCK_GOOGLE_USER.email;
    const googleProvidedName = MOCK_GOOGLE_USER.name;

    const existingUser = MOCK_USERS.find(u => u.email?.toLowerCase() === googleProvidedEmail.toLowerCase());

    if (existingUser) {
      if (existingUser.phoneNumber) {
        setCurrentUser(existingUser);
        setPendingGoogleUserEmail(null);
        setLoading(false);
        return { user: existingUser, needsPhoneNumber: false };
      } else {
        setPendingGoogleUserEmail(googleProvidedEmail); 
        setCurrentUser(null); 
        setLoading(false);
        return { user: existingUser, needsPhoneNumber: true, googleEmail: googleProvidedEmail };
      }
    } else {
      const newUserDraft: User = {
        id: `user-google-${Date.now()}`,
        email: googleProvidedEmail,
        name: googleProvidedName,
        phoneNumber: '', 
        isAdmin: false,
        defaultShippingAddress: null,
        withdrawalMethods: [],
        isAwaitingPhoneNumber: true, 
        googleEmail: googleProvidedEmail,
      };
      setPendingGoogleUserEmail(googleProvidedEmail);
      setCurrentUser(null);
      setLoading(false);
      return { user: newUserDraft, needsPhoneNumber: true, googleEmail: googleProvidedEmail };
    }
  };

  const completeGoogleSignInWithPhoneNumber = async (googleEmailToLink: string, phoneNumber: string): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const existingUserByPhone = MOCK_USERS.find(u => u.phoneNumber === phoneNumber);
    if (existingUserByPhone && existingUserByPhone.email?.toLowerCase() !== googleEmailToLink.toLowerCase()) {
        setLoading(false);
        return null; 
    }

    let userToUpdate = MOCK_USERS.find(u => u.email?.toLowerCase() === googleEmailToLink.toLowerCase());

    if (userToUpdate) {
      userToUpdate.phoneNumber = phoneNumber;
      userToUpdate.isAwaitingPhoneNumber = false;
    } else {
      userToUpdate = {
        id: `user-google-${Date.now()}`,
        email: googleEmailToLink,
        name: MOCK_GOOGLE_USER.name, 
        phoneNumber: phoneNumber,
        isAdmin: false,
        defaultShippingAddress: null,
        withdrawalMethods: [],
        isAwaitingPhoneNumber: false,
      };
      MOCK_USERS.push(userToUpdate);
    }
    
    setCurrentUser(userToUpdate);
    setPendingGoogleUserEmail(null); 
    setLoading(false);
    return userToUpdate;
  };

  const logout = () => {
    setCurrentUser(null);
    setPendingGoogleUserEmail(null);
    router.push('/');
  };

  const updateCurrentUserData = (dataToUpdate: Partial<User>) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...dataToUpdate };
      const userIndex = MOCK_USERS.findIndex(u => u.id === prevUser.id);
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...updatedUser };
      }
      return updatedUser;
    });
  };
  
  const clearPendingGoogleUser = () => {
    setPendingGoogleUserEmail(null);
  };

  const updateEmail = async (newEmail: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "Not authenticated." };
    if (MOCK_USERS.some(u => u.email?.toLowerCase() === newEmail.toLowerCase() && u.id !== currentUser.id)) {
      return { success: false, error: "Email already in use." };
    }
    updateCurrentUserData({ email: newEmail });
    return { success: true };
  };

  const updatePhoneNumber = async (newPhoneNumber: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "Not authenticated." };
    if (MOCK_USERS.some(u => u.phoneNumber === newPhoneNumber && u.id !== currentUser.id)) {
      return { success: false, error: "Phone number already in use." };
    }
    updateCurrentUserData({ phoneNumber: newPhoneNumber });
    return { success: true };
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "Not authenticated." };
    // In a real app, this would involve re-hashing and saving the new password.
    // For this mock, we just acknowledge the change conceptually.
    console.log(`Password for user ${currentUser.id} conceptually updated.`);
    return { success: true };
  };

  const isAuthenticated = !!currentUser && !currentUser.isAwaitingPhoneNumber;
  const isAdmin = !!currentUser?.isAdmin && !currentUser.isAwaitingPhoneNumber;

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        login, 
        logout, 
        register, 
        updateCurrentUserData, 
        signInWithGoogle,
        completeGoogleSignInWithPhoneNumber,
        clearPendingGoogleUser,
        updateEmail,
        updatePhoneNumber,
        updatePassword,
        loading, 
        isAuthenticated, 
        isAdmin,
        pendingGoogleUserEmail 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

    