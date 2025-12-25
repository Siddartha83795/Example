import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Location } from '@/types';

type AppRole = 'client' | 'staff' | 'admin';

interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: AppRole;
  location?: Location;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string, phone?: string, role?: AppRole, location?: Location) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  demoLogin: (role: 'client' | 'staff-medical' | 'staff-bitbites') => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials
const DEMO_CREDENTIALS = {
  client: { email: 'client@demo.com', password: 'demo123456' },
  'staff-medical': { email: 'staff-med@demo.com', password: 'demo123456' },
  'staff-bitbites': { email: 'staff-bit@demo.com', password: 'demo123456' },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and role
  const fetchProfile = async (userId: string) => {
    try {
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Get role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        return null;
      }

      const userProfile: UserProfile = {
        id: profileData.id,
        userId: profileData.user_id,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        role: roleData.role as AppRole,
        location: roleData.location as Location | undefined,
      };

      return userProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then((p) => {
          setProfile(p);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    phone?: string,
    role: AppRole = 'client',
    location?: Location
  ): Promise<{ error: Error | null }> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          phone,
          role,
          location,
        },
      },
    });

    return { error: error ? new Error(error.message) : null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const demoLogin = async (role: 'client' | 'staff-medical' | 'staff-bitbites'): Promise<{ error: Error | null }> => {
    const credentials = DEMO_CREDENTIALS[role];
    
    // Try to sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (!signInError) {
      return { error: null };
    }

    // If sign in failed (user doesn't exist), create the demo account
    if (signInError.message.includes('Invalid login credentials')) {
      const demoRole: AppRole = role === 'client' ? 'client' : 'staff';
      const demoLocation: Location | undefined = role === 'staff-medical' ? 'medical' : role === 'staff-bitbites' ? 'bitbites' : undefined;
      const demoName = role === 'client' ? 'Demo Customer' : role === 'staff-medical' ? 'Medical Staff' : 'Bit Bites Staff';

      const { error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: demoName,
            role: demoRole,
            location: demoLocation,
          },
        },
      });

      if (signUpError) {
        return { error: new Error(signUpError.message) };
      }

      // Auto-confirm is enabled, so try signing in again
      const { error: retryError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      return { error: retryError ? new Error(retryError.message) : null };
    }

    return { error: new Error(signInError.message) };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAuthenticated: !!user,
        isLoading,
        signUp,
        signIn,
        signOut,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
