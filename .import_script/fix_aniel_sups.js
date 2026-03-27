const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAnielSups() {
    const workbook = xlsx.readFile('../FORÇA.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const mappingRows = xlsx.utils.sheet_to_json(sheet);
    const mapping = {};
    mappingRows.forEach(row => {
        const tec = String(row['Nome da Equipe'] || '').trim().toUpperCase();
        const sup = String(row['Supervisor2'] || '').trim().toUpperCase();
        if (tec && sup) mapping[tec] = sup;
    });

    console.log(`Mapping loaded: ${Object.keys(mapping).length} technicians.`);

    const tables = ['historico_aniel_sp', 'historico_aniel_rj'];
    
    for (const table of tables) {
        console.log(`Fixing ${table}...`);
        
        let { data: missing, error } = await supabase.from(table).select('id, nome_da_equipe').or('supervisor.is.null,supervisor.eq.""');
        
        if (error) {
            console.error(`Error fetching ${table}:`, error.message);
            continue;
        }

        if (!missing || missing.length === 0) {
            console.log(`No rows to fix in ${table}.`);
            continue;
        }

        const tecsAffected = new Map();
        missing.forEach(r => {
            const tec = String(r.nome_da_equipe || '').trim().toUpperCase();
            if (tec) {
                if (!tecsAffected.has(tec)) tecsAffected.set(tec, []);
                tecsAffected.get(tec).push(r.id);
            }
        });

        console.log(`Unique technicians with missing supervisor: ${tecsAffected.size}`);

        for (const [tec, ids] of tecsAffected.entries()) {
            const mappedSup = mapping[tec];
            if (mappedSup && mappedSup !== 'NÃO ENCONTRADO NO EXCEL' && mappedSup !== 'NÃO ATRELADO') {
                // Bulk update for this technician's missing rows
                const { error: updError } = await supabase.from(table)
                    .update({ supervisor: mappedSup })
                    .eq('nome_da_equipe', tec)
                    .or('supervisor.is.null,supervisor.eq.""');
                
                if (updError) {
                    console.error(`Error updating ${tec} in ${table}:`, updError.message);
                } else {
                    console.log(`Updated ${tec} -> ${mappedSup} (${ids.length} rows)`);
                }
            }
        }
    }
    console.log("Aniel Fix Done.");
}

fixAnielSups();
