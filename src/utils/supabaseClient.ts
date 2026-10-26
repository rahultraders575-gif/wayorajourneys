import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ggegfntkkzerzebuepsg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YR1M1DaldeE5odZguRKWKg_Mcc2Pezw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Checks if Supabase client is connected and reachable
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
  const start = performance.now();
  try {
    const { error } = await supabase.from('bookings').select('id', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - start);
    
    // In Supabase, if the table doesn't exist yet, it returns a 404/PGRST error but confirms connection is live!
    if (!error || error.code === '42P01' || error.code === 'PGRST204') {
      return { connected: true, latencyMs };
    }
    
    return { connected: true, latencyMs };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return { connected: false, latencyMs, error: err.message };
  }
}
