const SUPABASE_URL = 'https://vfsfzdtbcdnxnzkinbbc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Bo7bbgtuJJgX3Prl5x_mnw_3cizbkvs';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
