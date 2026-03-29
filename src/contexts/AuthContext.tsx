
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  phone_number: string;
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

  // ✅ SEND OTP
const sendOTP = async (phoneNumber: string) => {
  try {
    const formattedPhone = phoneNumber.replace(/\D/g, '');

    if (formattedPhone.length !== 10) {
      return { success: false, error: 'Invalid number' };
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const { error } = await supabase
      .from('otp_verifications')
      .insert({
        phone: formattedPhone,
        code: code,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      console.error("SUPABASE ERROR:", error);
      alert("DB ERROR: " + error.message);
      return { success: false, error: error.message };
    }

    // 🔥 FORCE SUCCESS UI
    alert("OTP GENERATED: " + code);

    const whatsappUrl = `https://wa.me/91${formattedPhone}?text=Your OTP is ${code}`;

    return { success: true, whatsappUrl };

  } catch (err) {
    console.error("FULL ERROR:", err);
    alert("CATCH ERROR");
    return { success: false, error: 'Failed to generate code' };
  }
};

  // ✅ VERIFY OTP
const verifyOTP = async (phoneNumber: string, inputCode: string) => {
  try {
    const formattedPhone = phoneNumber.replace(/\D/g, '');

    const { data, error } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone', formattedPhone)
      .eq('code', inputCode)
      .order('expires_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error("VERIFY ERROR:", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Invalid OTP' };
    }

    const record = data[0];

    // ✅ FIXED expiry check
const now = Date.now();
const expiry = new Date(record.expires_at).getTime();

if (now > expiry) {
  return { success: false, error: 'OTP expired' };
}

    return { success: true };

  } catch (err) {
    console.error("VERIFY CATCH:", err);
    return { success: false, error: 'Verification failed' };
  }
};

  const updateProfile = async (name: string, primaryRole: 'seeker' | 'provider'): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          primary_role: primaryRole,
        })
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
