import { createClient } from '@supabase/supabase-js';

// Membaca environment variables dari .env file
// Jika tidak diset (misal dalam tahap dev awal), akan jatuh ke default Supabase local port (54321)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key-to-prevent-crash';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

