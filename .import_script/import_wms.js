const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://tedclftyfdjktxeqjpcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGNsZnR5ZmRqa3R4ZXFqcGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk1MjMsImV4cCI6MjA5MDAzNTUyM30.wvGWKq8sfgitGfD2mIJBZnCAg-wOHO2VdoBgqyofY5k';
const supabase = createClient(supabaseUrl, supabaseKey);

const folderPath = '../HISTORICO VOLANTE WMS';

function sanitizeName(name) {
    if (!name) return 'col';
    return name.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_').replace(/^([0-9])/, 'c_$1');
}

async function run() {
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.xlsx'));
    
    for (const file of files) {
        const fullPath = path.join(folderPath, file);
        console.log(`Processing ${file}`);
        let workbook;
        try {
            workbook = xlsx.readFile(fullPath);
        } catch(e) {
            console.error(`Failed to read ${file}`, e);
            continue;
        }

        for (const sheetName of workbook.SheetNames) {
            console.log(`Sheet: ${sheetName}`);
            
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
            
            // Map the sanitized schema to our own known columns if possible
            // Our target columns: empresa, nome_fantasia_empresa, tecnico, regional, grupo_produto, part_number, codigo, nome, unidade, quantidade, tipo
            
            let batchSP = [];
            let batchRJ = [];
            let batchOutros = [];
            
            for (let i = headerRowIdx + 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.every(v => v === null || v === '')) continue;
                
                let obj = { arquivo_origem: file };
                colNames.forEach((col, colIdx) => {
                    let val = row[colIdx];
                    if (typeof val === 'string') val = val.trim();
                    // if the column name doesn't match the table exactly, it will just not be inserted or will cause error. 
                    // But our columns align closely since they were sanitized similarly. Let's make sure:
                    obj[col] = (val === null || val === undefined) ? null : String(val);
                });
                
                // Determine destination
                const nomeFantasia = obj['nome_fantasia_empresa'] || obj['nome_fantasia'] || '';
                const regional = obj['regional'] || '';
                
                let dest = 'historico_wms_outros';
                let checkStr = (nomeFantasia + ' ' + regional).toUpperCase();
                
                if (checkStr.includes('- SP') || checkStr.includes(' SP ') || checkStr.match(/(\s|-|^)SP(\s|-|$)/) || checkStr.includes('SÃO PAULO') || checkStr.includes('SAO PAULO') || checkStr.includes('TSP')) {
                    dest = 'historico_wms_sp';
                } else if (checkStr.includes('- RJ') || checkStr.includes(' RJ ') || checkStr.match(/(\s|-|^)RJ(\s|-|$)/) || checkStr.includes('RIO DE JANEIRO') || checkStr.includes('TRJ')) {
                    dest = 'historico_wms_rj';
                }
                
                if (dest === 'historico_wms_sp') batchSP.push(obj);
                else if (dest === 'historico_wms_rj') batchRJ.push(obj);
                else batchOutros.push(obj);
                
                // Flush
                if (batchSP.length >= 200) {
                    const { error } = await supabase.from('historico_wms_sp').insert(batchSP);
                    if (error) console.error(`SP Insert Error:`, error.message);
                    batchSP = [];
                }
                if (batchRJ.length >= 200) {
                    const { error } = await supabase.from('historico_wms_rj').insert(batchRJ);
                    if (error) console.error(`RJ Insert Error:`, error.message);
                    batchRJ = [];
                }
                if (batchOutros.length >= 200) {
                    const { error } = await supabase.from('historico_wms_outros').insert(batchOutros);
                    if (error) console.error(`Outros Insert Error:`, error.message);
                    batchOutros = [];
                }
            }
            
            if (batchSP.length > 0) {
                const { error } = await supabase.from('historico_wms_sp').insert(batchSP);
                if (error) console.error(`SP Insert Error:`, error.message);
            }
            if (batchRJ.length > 0) {
                const { error } = await supabase.from('historico_wms_rj').insert(batchRJ);
                if (error) console.error(`RJ Insert Error:`, error.message);
            }
            if (batchOutros.length > 0) {
                const { error } = await supabase.from('historico_wms_outros').insert(batchOutros);
                if (error) console.error(`Outros Insert Error:`, error.message);
            }
            console.log(`Finished ${file}`);
        }
    }
}
run().catch(console.error);
