const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncMapping() {
    // 1. Get mapping from Excel
    const workbook = xlsx.readFile('../FORÇA.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const batch = [];
    rows.forEach(row => {
        const tec = String(row['Nome da Equipe'] || '').trim().toUpperCase();
        const sup = String(row['Supervisor2'] || '').trim().toUpperCase();
        if (tec && sup) {
            batch.push({ tecnico: tec, supervisor: sup });
        }
    });

    console.log(`Prepared ${batch.length} rows.`);

    // 2. Clear and Insert into Supabase mapping_tecnico_supervisor
    // Note: The table must exist first or be created.
    // I'll try to insert. If table doesn't exist, this will fail but the error will guide me.
    
    // Actually I'll use rpc or just multiple calls.
    // Clearing the mapping table
    console.log("Cleaning old mapping...");
    await supabase.from('mapping_tecnico_supervisor').delete().neq('tecnico', '');

    console.log("Inserting new mapping...");
    const { error } = await supabase.from('mapping_tecnico_supervisor').insert(batch);
    if (error) {
        console.error("Insert Error:", error.message);
        console.log("Attempting to create the table first may be required.");
    } else {
        console.log("Mapping synced successfully!");
    }
}

syncMapping();
