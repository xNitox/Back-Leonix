
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config();

const supabaseUrl =   process.env.SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;
const supabasePublishableKey= process.env.SUPABASE_PUBLISHABLE_KEY!;
export const supabaseAdmin = createClient (supabaseUrl, supabaseSecretKey,{
    auth:{
        persistSession: false
    }
});

export const supabasePublish = createClient(supabaseUrl,supabasePublishableKey,{
    auth:{
        persistSession:false
    }
})