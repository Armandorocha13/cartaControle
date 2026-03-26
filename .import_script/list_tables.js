const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Listing tables...");
    const { data, error } = await supabase.rpc('get_tables'); // Check if there's a custom RPC
    if (error) {
        console.log("RPC get_tables failed, trying select from pg_catalog/information_schema...");
        const { data: data2, error: error2 } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
        if (error2) {
            console.error(error2);
            // Alternative: try to select from a common table just to see if it works
            return;
        }
        console.log("Tables:", data2.map(t => t.table_name));
    } else {
        console.log("Tables:", data);
    }
}

run();
