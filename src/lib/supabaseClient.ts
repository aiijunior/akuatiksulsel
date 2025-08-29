import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

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
