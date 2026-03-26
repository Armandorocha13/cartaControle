const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Checking columns for parametros_asd...");
    const { data, error } = await supabase.from('parametros_asd').select('*').limit(1);
    if (error) { console.error(error); return; }
    if (data && data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
    } else {
        console.log("No data found in parametros_asd");
    }
}

run();
