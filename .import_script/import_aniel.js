const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

function sanitizeName(name) {
    if (!name) return 'col';
    return name.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_').replace(/^([0-9])/, 'c_$1');
}

async function processFolder(folderPath, tableName) {
    if (!fs.existsSync(folderPath)) return;
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.xlsx'));
    
    for (const file of files) {
        const fullPath = path.join(folderPath, file);
        console.log(`Processing ${file}`);
        
        // Extract date from filename
        let fileDate = null;
        const match = file.match(/(\d{2})\.(\d{2})\.(\d{4})/);
        if (match) {
            fileDate = `${match[3]}-${match[2]}-${match[1]}`;
        }
        
        let workbook;
        try {
            workbook = xlsx.readFile(fullPath);
        } catch(e) {
            console.error(`Failed to read ${file}`, e);
            continue;
        }

        for (const sheetName of workbook.SheetNames) {
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
            
            let batch = [];
            for (let i = headerRowIdx + 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.every(v => v === null || v === '')) continue;
                
                let obj = { arquivo_origem: file, data: fileDate };
                colNames.forEach((col, colIdx) => {
                    let val = row[colIdx];
                    if (typeof val === 'string') val = val.trim();
                    obj[col] = (val === null || val === undefined) ? null : String(val);
                });
                
                batch.push(obj);
                
                if (batch.length >= 200) {
                    const { error } = await supabase.from(tableName).insert(batch);
                    if (error) {
                        console.error(`Insert Error in ${tableName}:`, error.message);
                    }
                    batch = [];
                }
            }
            if (batch.length > 0) {
                const { error } = await supabase.from(tableName).insert(batch);
                if (error) console.error(`Insert Error in ${tableName}:`, error.message);
            }
            console.log(`Finished sheet ${sheetName} of ${file}`);
        }
    }
}

async function run() {
    console.log("Starting SP...");
    await processFolder('../HISTORICO VOLANTE ANIEL/SP', 'historico_aniel_sp');
    console.log("Starting RJ...");
    await processFolder('../HISTORICO VOLANTE ANIEL/RJ', 'historico_aniel_rj');
    console.log("All done!");
}
run().catch(console.error);
