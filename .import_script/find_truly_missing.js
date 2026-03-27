const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

const normStr = (s) => String(s || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

async function findTrulyMissing() {
    const workbook = xlsx.readFile('../FORÇA.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const mappingRows = xlsx.utils.sheet_to_json(sheet);
    const mapping = new Set();
    mappingRows.forEach(row => {
        mapping.add(normStr(row['Nome da Equipe']));
    });

    const tables = [
        { name: 'historico_aniel_sp', col: 'nome_da_equipe' },
        { name: 'historico_aniel_rj', col: 'nome_da_equipe' },
        { name: 'historico_wms_sp', col: 'tecnico' },
        { name: 'historico_wms_rj', col: 'tecnico' }
    ];

    const missingTotal = new Set();

    for (const table of tables) {
        const { data, error } = await supabase.from(table.name).select(table.col);
        if (error) continue;
        data.forEach(r => {
            const tec = normStr(r[table.col]);
            if (tec && !mapping.has(tec)) missingTotal.add(tec);
        });
    }

    console.log(`=== TÉCNICOS SEM SUPERVISOR (NÃO ESTÃO NO EXCEL) === (${missingTotal.size} encontrados)`);
    [...missingTotal].sort().forEach(t => console.log(t));
}

findTrulyMissing();
