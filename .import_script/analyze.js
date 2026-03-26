const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching parameters...");
    const { data: params, error: pErr } = await supabase.from('parametros_parametros').select('cod__material,descricao,qtde_padrao');
    if (pErr) { console.error(pErr); return; }

    const paramMap = new Map();
    params.forEach(p => {
        paramMap.set(p.cod__material, parseFloat(p.qtde_padrao || 0));
    });

    console.log("Fetching consolidated data (sample)...");
    const { data: aniel, error: aErr } = await supabase.from('consolidado_aniel').select('cod__material,saldo').limit(1000);
    if (aErr) { console.error(aErr); return; }

    const stats = {};

    aniel.forEach(r => {
        const goal = paramMap.get(r.cod__material);
        if (!goal || goal === 0) return;
        
        const saldo = parseFloat(r.saldo || 0);
        const percent = (saldo / goal) * 100;

        if (!stats[r.cod__material]) {
            stats[r.cod__material] = { sum: 0, count: 0, desc: '' };
        }
        stats[r.cod__material].sum += percent;
        stats[r.cod__material].count++;
    });

    console.log("\n--- Analysis per Material (Sample) ---");
    for (const code in stats) {
        const avg = stats[code].sum / stats[code].count;
        console.log(`Code: ${code} | Avg %: ${avg.toFixed(2)}% | Samples: ${stats[code].count}`);
    }
}

run();
