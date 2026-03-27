const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findMissingSups() {
    // 1. Get mapping from Excel
    const workbook = xlsx.readFile('../FORÇA.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const mappingRows = xlsx.utils.sheet_to_json(sheet);
    const mapping = {};
    mappingRows.forEach(row => {
        const tec = String(row['Nome da Equipe'] || '').trim().toUpperCase();
        const sup = String(row['Supervisor2'] || '').trim().toUpperCase();
        if (tec) mapping[tec] = sup;
    });

    console.log(`Mapping loaded: ${Object.keys(mapping).length} technicians.`);

    // 2. Query Supabase for rows with empty supervisor in SP (most likely place)
    // We'll check both SP and RJ
    const tables = ['historico_aniel_sp', 'historico_aniel_rj', 'historico_wms_sp', 'historico_wms_rj'];
    
    for (const table of tables) {
        console.log(`Checking ${table}...`);
        // Aniel uses 'nome_da_equipe' or 'tecnico'
        // WMS uses 'tecnico'
        const { data, error } = await supabase.from(table).select('*').or('supervisor.is.null,supervisor.eq.""');
        
        if (error) {
            console.error(`Error checking ${table}:`, error.message);
            continue;
        }

        if (!data || data.length === 0) {
            console.log(`No missing supervisors in ${table}.`);
            continue;
        }

        const uniqueMissing = new Set();
        data.forEach(r => {
            const tec = (r.nome_da_equipe || r.tecnico || '').trim().toUpperCase();
            if (tec) uniqueMissing.add(tec);
        });

        console.log(`Found ${uniqueMissing.size} technicians with missing supervisors in ${table}.`);
        
        uniqueMissing.forEach(tec => {
            const mappedSup = mapping[tec] || 'NÃO ENCONTRADO NO EXCEL';
            console.log(`  - Técnico: ${tec} -> Supervisor Sugerido: ${mappedSup}`);
        });
    }
}

findMissingSups();
