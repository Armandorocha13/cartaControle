const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSemSupervisorRows() {
    const tables = [
        { name: 'historico_aniel_sp', col: 'nome_da_equipe' },
        { name: 'historico_aniel_rj', col: 'nome_da_equipe' },
        { name: 'historico_wms_sp', col: 'tecnico' },
        { name: 'historico_wms_rj', col: 'tecnico' }
    ];
    
    for (const table of tables) {
        // Since WMS tables don't have supervisor column, we query all rows to check them in UI
        let query = supabase.from(table.name).select(`id, ${table.col}`);
        
        // For Aniel tables, check 'supervisor' column
        if (table.name.includes('aniel')) {
            const { data, count, error } = await supabase.from(table.name).select(`id, ${table.col}, supervisor`, { count: 'exact' }).or('supervisor.is.null,supervisor.eq.""');
            if (error) {
                console.error(`Erro em ${table.name}:`, error.message);
                continue;
            }
            if (count > 0) {
                const tecs = new Set();
                data.forEach(r => tecs.add(String(r[table.col] || 'SEM NOME').toUpperCase()));
                console.log(`📦 ${table.name}: ${count} linhas SEM SUPERVISOR. Técnicos:`, [...tecs]);
            } else {
                console.log(`📦 ${table.name}: 0 linhas sem supervisor.`);
            }
        } else {
            // WMS tables
            const { count, error } = await supabase.from(table.name).select('id', { count: 'exact' });
            if (error) continue;
            console.log(`📦 ${table.name}: ${count} linhas (Todas dependem do mapeamento da UI para supervisor).`);
        }
    }
}

checkSemSupervisorRows();
