
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnzqsfynufaymmbwkdzm.supabase.co';
const supabaseAnonKey ='sb_publishable_szBimP9JvbLTK7aCtfAziA_3vJuyD2d';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);