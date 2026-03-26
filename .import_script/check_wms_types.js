const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Checking unique 'tipo' in historico_wms_sp...");
    const { data, error } = await supabase.from('historico_wms_sp').select('tipo');
    if (error) { console.error("Error:", error.message); return; }
    const types = new Set(data.filter(r => r.tipo).map(r => r.tipo));
    console.log("Unique types:", [...types]);
}

run();
