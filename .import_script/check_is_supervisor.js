const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIsSupervisor() {
    const workbook = xlsx.readFile('../FORÇA.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const technicians = new Set();
    const supervisors = new Set();
    rows.forEach(row => {
        const tec = String(row['Nome da Equipe'] || '').trim().toUpperCase();
        const sup = String(row['Supervisor2'] || '').trim().toUpperCase();
        if (tec) technicians.add(tec);
        if (sup) supervisors.add(sup);
    });

    const tables = ['historico_aniel_sp', 'historico_aniel_rj', 'historico_wms_sp', 'historico_wms_rj'];
    const missing = new Set();

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('nome_da_equipe, tecnico, supervisor').or('supervisor.is.null,supervisor.eq.""');
        if (error) continue;
        data.forEach(r => {
            const tec = (r.nome_da_equipe || r.tecnico || '').trim().toUpperCase();
            if (tec && !technicians.has(tec)) missing.add(tec);
        });
    }

    console.log(`Encontrados ${missing.size} técnicos ausentes no mapeamento de equipe.\n`);
    
    missing.forEach(tec => {
        if (supervisors.has(tec)) {
            console.log(`⚠️ ${tec}: Este nome é um SUPERVISOR no Excel. Ele deve ser agrupado sob si mesmo ou sob a coordenação.`);
        } else {
            console.log(`❓ ${tec}: Não encontrado no Excel nem como técnico nem como supervisor.`);
        }
    });
}

checkIsSupervisor();
