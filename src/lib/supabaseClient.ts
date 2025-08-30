// FIX: Resolved TypeScript errors for `import.meta.env` by correctly augmenting the global
// `ImportMeta` type. The previous attempt used local interfaces which are not effective
// for modifying global types within a module. Using `declare global` ensures the
// type definitions for Vite's environment variables are recognized.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_ANON_KEY: string;
    }
  }
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    const errorMsg = "Konfigurasi VITE_SUPABASE_URL tidak ditemukan. Pastikan Anda telah membuat file .env dari .env.example dan mengisinya, atau mengatur environment variables di Netlify.";
    console.error(errorMsg);
    alert(errorMsg);
    throw new Error(errorMsg);
}
if (!supabaseAnonKey) {
    const errorMsg = "Konfigurasi VITE_SUPABASE_ANON_KEY tidak ditemukan. Pastikan Anda telah membuat file .env dari .env.example dan mengisinya, atau mengatur environment variables di Netlify.";
    console.error(errorMsg);
    alert(errorMsg);
    throw new Error(errorMsg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
