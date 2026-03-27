const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findUnknownTecl() {
    // 1. Get mapping from Excel
    const workbook = xlsx.readFile('../FORÇA.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const mappingRows = xlsx.utils.sheet_to_json(sheet);
    const mapping = new Set();
    mappingRows.forEach(row => {
        const tec = String(row['Nome da Equipe'] || '').trim().toUpperCase();
        if (tec) mapping.add(tec);
    });

    const tables = ['historico_aniel_sp', 'historico_aniel_rj', 'historico_wms_sp', 'historico_wms_rj'];
    const unknownPerTable = {};

    for (const table of tables) {
        // Since WMS doesn't have supervisor column, we check all unique technicians
        const { data, error } = await supabase.from(table).select('nome_da_equipe, tecnico');
        if (error) continue;

        const set = new Set();
        data.forEach(r => {
            const tec = (r.nome_da_equipe || r.tecnico || '').trim().toUpperCase();
            if (tec && !mapping.has(tec)) set.add(tec);
        });
        unknownPerTable[table] = [...set];
    }

    console.log("=== TÉCNICOS NO BANCO MAS AUSENTES NO EXCEL (FORÇA.xlsx) ===");
    for (const [table, list] of Object.entries(unknownPerTable)) {
        if (list.length > 0) {
            console.log(`\n📦 Tabela: ${table} (${list.length} encontrados)`);
            list.sort().forEach(t => console.log(`  - ${t}`));
        }
    }
}

findUnknownTecl();
