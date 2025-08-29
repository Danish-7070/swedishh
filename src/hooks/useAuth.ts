import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  roles: string[];
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(
            role_id,
            roles(name, description)
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      const userRoles = profile.user_roles || [];
      const primaryRole = userRoles.length > 0 ? userRoles[0].roles.name : profile.role || 'member';

      setUser({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: primaryRole,
        roles: userRoles.map((ur: any) => ur.roles.name)
      });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    if (response.success && response.data) {
      setUser(response.data.user);
      // Store in localStorage for persistence
      localStorage.setItem('auth_token', response.data.session.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response;
  };

  const logout = async () => {
    const response = await authAPI.logout();
    if (response.success) {
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    return response;
  };

  const register = async (email: string, password: string, fullName: string) => {
    return await authAPI.register(email, password, fullName);
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };
};