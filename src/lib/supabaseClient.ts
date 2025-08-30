// FIX: The original file had a reference to `vite/client` which was not being found.
// This is typically due to a missing `vite-env.d.ts` or a misconfiguration in `tsconfig.json`.
// To fix this without adding new files or changing configuration, we manually
// define the types for `import.meta.env` in this file. This resolves all three
// TypeScript errors related to environment variables.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
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
