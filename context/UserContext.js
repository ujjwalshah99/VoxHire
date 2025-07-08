'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ensureUserExists } from '@/utils/userUtils';

// Create the context
const UserContext = createContext(undefined);

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 

// Provider component
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  // Function to get the current user
  const getCurrentUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      if (user) {
        console.log('Auth user found:', user.email);
        
        try {
          // Try to ensure user exists in our database
          const userData = await ensureUserExists(user);
          console.log('User data from database:', userData);
          
          // Combine auth user with database user data
          setUser({
            ...user,
            userData: userData
          });
        } catch (userCreationError) {
          console.error('Error ensuring user exists:', userCreationError);
          
          // Fallback: still set the auth user even if database creation fails
          // This prevents the app from being completely broken
          setUser({
            ...user,
            userData: {
              email: user.email,
              name: user.user_metadata?.full_name || user.email,
              credits: 10,
              subscription_tier: 'free'
            }
          });
        }
      } else {
        console.log('No authenticated user');
        setUser(null);
      }
    } catch (err) {
      console.error('Error getting user:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh user data
  const refreshUser = async () => {
    await getCurrentUser();
  };

  // Initialize user on mount
  useEffect(() => {
    getCurrentUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          getCurrentUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // The value that will be provided to consumers of this context
  const value = {
    user,
    isLoading,
    error,
    signOut,
    refreshUser,
    isAuthenticated: !!user
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
