import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

// The Supabase client is available on the window object because we're loading it from a CDN
const { createClient } = (window as any).supabase;

if (!SUPABASE_URL || SUPABASE_URL.includes('<ID_PROYEK_ANDA>')) {
    const errorMsg = "Supabase URL is not configured. Please check your config.ts file.";
    console.error(errorMsg);
    alert(errorMsg);
}
if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('<KUNCI_ANON_PUBLIK_ANDA>')) {
    const errorMsg = "Supabase Anon Key is not configured. Please check your config.ts file.";
    console.error(errorMsg);
    alert(errorMsg);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
