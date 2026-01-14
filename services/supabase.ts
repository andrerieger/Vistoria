import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgukdcgztdpbcganyaps.supabase.co';
const supabaseKey = 'sb_publishable_5clGc03IywZxtH6s-UBysQ_pwCr0MLG';

export const supabase = createClient(supabaseUrl, supabaseKey);