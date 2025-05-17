'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

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
        // Get additional user data from the database if needed
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error fetching user data:', userError);
        }
        
        // Combine auth user with database user data
        setUser({
          ...user,
          userData: userData || null
        });
      } else {
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
