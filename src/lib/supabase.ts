import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          category: 'real_estate' | 'services';
          title: string;
          description: string;
          location: string;
          budget_min: number | null;
          budget_max: number | null;
          contact_preference: 'email' | 'phone' | 'both';
          status: 'active' | 'fulfilled' | 'expired';
          created_at: string;
          updated_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: 'real_estate' | 'services';
          title: string;
          description: string;
          location: string;
          budget_min?: number | null;
          budget_max?: number | null;
          contact_preference?: 'email' | 'phone' | 'both';
          status?: 'active' | 'fulfilled' | 'expired';
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: 'real_estate' | 'services';
          title?: string;
          description?: string;
          location?: string;
          budget_min?: number | null;
          budget_max?: number | null;
          contact_preference?: 'email' | 'phone' | 'both';
          status?: 'active' | 'fulfilled' | 'expired';
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
        };
      };
    };
  };
};
