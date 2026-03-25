const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

const files = [
    { path: '../FORÇA.xlsx', prefix: 'forca' },
    { path: '../PARAMETROS KITS.xlsx', prefix: 'parametros' }
];

function sanitizeName(name) {
    if (!name) return 'col';
    return name.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_').replace(/^([0-9])/, 'c_$1');
}

async function run() {
    for (const f of files) {
        console.log(`Processing ${f.path}`);
        const workbook = xlsx.readFile(f.path);
        for (const sheetName of workbook.SheetNames) {
            const tableName = sanitizeName(f.prefix + '_' + sheetName);
            console.log(`Table: ${tableName}`);
            
            const worksheet = workbook.Sheets[sheetName];
            const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });
            if (rows.length === 0) continue;
            
            let headerRowIdx = 0;
            let headers = [];
            for (let i = 0; i < rows.length; i++) {
                if (rows[i] && rows[i].some(v => v !== null && v !== '')) {
                    headerRowIdx = i;
                    headers = rows[i];
                    break;
                }
            }
            
            const colNames = [];
            const seen = new Set();
            headers.forEach((h, i) => {
                let colName = sanitizeName(h);
                if (!colName || colName === 'col') colName = 'col_' + i;
                let finalName = colName;
                let counter = 1;
                while(seen.has(finalName)) {
                    finalName = colName + '_' + counter;
                    counter++;
                }
                seen.add(finalName);
                colNames.push(finalName);
            });
            
            let currentBatch = [];
            for (let i = headerRowIdx + 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.every(v => v === null || v === '')) continue;
                
                let obj = {};
                colNames.forEach((col, colIdx) => {
                    let val = row[colIdx];
                    if (typeof val === 'string') val = val.trim();
                    obj[col] = (val === null || val === undefined) ? null : String(val);
                });
                
                currentBatch.push(obj);
                if (currentBatch.length >= 200) {
                    const { error } = await supabase.from(tableName).insert(currentBatch);
                    if (error) console.error(`Error inserting into ${tableName}:`, error.message);
                    currentBatch = [];
                }
            }
            if (currentBatch.length > 0) {
                const { error } = await supabase.from(tableName).insert(currentBatch);
                if (error) console.error(`Error inserting into ${tableName}:`, error.message);
            }
            console.log(`Finished ${tableName}`);
        }
    }
}
run().catch(console.error);
