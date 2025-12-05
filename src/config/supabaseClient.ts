import { createClient } from "@supabase/supabase-js";

// VITE_ environment variables are exposed to the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
