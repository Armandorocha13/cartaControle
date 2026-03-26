const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(name) {
    const { data, error } = await supabase.from(name).select('*').limit(2);
    if (error) { console.log(name + ': ERROR -', error.message); return null; }
    if (data && data.length > 0) {
        console.log('\n=== ' + name + ' ===');
        console.log('Cols:', Object.keys(data[0]));
        data.forEach((row, i) => console.log('Row ' + i + ':', JSON.stringify(row)));
    } else {
        console.log(name + ': EMPTY');
    }
    return data;
}

async function run() {
    await checkTable('historico_aniel_sp');
    await checkTable('historico_aniel_rj');
    await checkTable('historico_wms_sp');
    await checkTable('historico_wms_rj');
}

run();
