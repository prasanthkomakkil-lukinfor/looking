import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  phone: string;
  phone_number?: string;
  name: string | null;
  primary_role: 'seeker' | 'provider';
  can_be_provider: boolean;
  is_admin: boolean;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; error?: string; whatsappUrl?: string }>;
  verifyOTP: (phoneNumber: string, code: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (name: string, primaryRole: 'seeker' | 'provider') => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('lookingfor_user_id');
    if (storedUserId) {
      loadUser(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (data && !error) {
        setUser(data);
      } else {
        localStorage.removeItem('lookingfor_user_id');
      }
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (phoneNumber: string) => {
    try {
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.length !== 10) return { success: false, error: 'Invalid phone number' };

      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('otp_verifications')
        .insert({ phone: formattedPhone, code, expires_at: expiresAt });

      if (error) return { success: false, error: error.message };

      const message = `Your LookingFor.in login code is: ${code}`;
      const whatsappUrl = `https://wa.me/91${formattedPhone}?text=${encodeURIComponent(message)}`;
      return { success: true, whatsappUrl };
    } catch (err) {
      return { success: false, error: 'Failed to generate code' };
    }
  };

  const verifyOTP = async (phoneNumber: string, inputCode: string) => {
    try {
      const formattedPhone = phoneNumber.replace(/\D/g, '');

      const { data, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', formattedPhone)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) return { success: false, error: error.message };
      if (!data || data.length === 0) return { success: false, error: 'No OTP found. Please request a new one.' };

      const record = data[0];
      if (record.code !== inputCode) return { success: false, error: 'Invalid OTP. Please try again.' };

      const { data: validOtp } = await supabase
        .from('otp_verifications')
        .select('id')
        .eq('id', record.id)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!validOtp) return { success: false, error: 'OTP expired. Please request a new one.' };

      // Find or create user
      let { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', formattedPhone)
        .maybeSingle();

      if (!existingUser) {
        // Try phone_number column as fallback
        const { data: byPhoneNumber } = await supabase
          .from('users')
          .select('*')
          .eq('phone_number', formattedPhone)
          .maybeSingle();
        existingUser = byPhoneNumber;
      }

      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            phone: formattedPhone,
            phone_number: formattedPhone,
            primary_role: 'seeker',
            can_be_provider: false,
            is_admin: false,
            is_verified: true,
          })
          .select()
          .single();

        if (createError) {
          console.error('CREATE USER ERROR:', createError);
          return { success: false, error: 'Failed to create account: ' + createError.message };
        }
        existingUser = newUser;
      }

      localStorage.setItem('lookingfor_user_id', existingUser.id);
      setUser(existingUser);
      return { success: true };
    } catch (err) {
      console.error('VERIFY CATCH:', err);
      return { success: false, error: 'Verification failed. Please try again.' };
    }
  };

  const updateProfile = async (name: string, primaryRole: 'seeker' | 'provider') => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: name.trim(), primary_role: primaryRole })
        .eq('id', user.id);
      if (error) throw error;
      setUser({ ...user, name: name.trim(), primary_role: primaryRole });
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('lookingfor_user_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendOTP, verifyOTP, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
