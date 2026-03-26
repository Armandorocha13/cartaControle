const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Counting rows...");
    const { count: cSP, error: eSP } = await supabase.from('historico_aniel_sp').select('*', { count: 'exact', head: true });
    const { count: cRJ, error: eRJ } = await supabase.from('historico_aniel_rj').select('*', { count: 'exact', head: true });
    
    console.log("Aniel SP:", cSP);
    console.log("Aniel RJ:", cRJ);
}

run();
