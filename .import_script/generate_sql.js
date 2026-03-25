const xlsx = require('xlsx');
const fs = require('fs');

const files = [
    { path: '../FORÇA.xlsx', prefix: 'forca' },
    { path: '../PARAMETROS KITS.xlsx', prefix: 'parametros' }
];

function sanitizeName(name) {
    if (!name) return 'col';
    return name.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_').replace(/^([0-9])/, 'c_$1');
}

let createSql = '';
let insertSqls = [];

files.forEach(f => {
    console.log(`Processing ${f.path}`);
    const workbook = xlsx.readFile(f.path);
    workbook.SheetNames.forEach(sheetName => {
        const tableName = sanitizeName(f.prefix + '_' + sheetName);
        console.log(`Table: ${tableName}`);
        
        const worksheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });
        if (rows.length === 0) return;
        
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
        
        createSql += `DROP TABLE IF EXISTS "${tableName}";\n`;
        createSql += `CREATE TABLE "${tableName}" (\n`;
        createSql += `  id SERIAL PRIMARY KEY,\n`;
        colNames.forEach((col, i) => {
            createSql += `  "${col}" TEXT${i === colNames.length - 1 ? '' : ','}\n`;
        });
        createSql += `);\n\n`;
        
        let currentBatch = [];
        for (let i = headerRowIdx + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.every(v => v === null || v === '')) continue;
            
            const values = colNames.map((_, colIdx) => {
                let val = row[colIdx];
                if (val === null || val === undefined) return 'NULL';
                if (typeof val === 'string') {
                    val = val.replace(/'/g, "''");
                    return `'${val}'`;
                }
                return `'${val}'`;
            });
            currentBatch.push(`(${values.join(', ')})`);
            
            if (currentBatch.length >= 200) {
                insertSqls.push(`INSERT INTO "${tableName}" ("${colNames.join('", "')}") VALUES\n${currentBatch.join(',\n')};`);
                currentBatch = [];
            }
        }
        if (currentBatch.length > 0) {
            insertSqls.push(`INSERT INTO "${tableName}" ("${colNames.join('", "')}") VALUES\n${currentBatch.join(',\n')};`);
        }
    });
});

fs.writeFileSync('schema.sql', createSql);
console.log(`Wrote schema.sql`);
insertSqls.forEach((sql, idx) => {
    fs.writeFileSync(`insert_${idx}.sql`, sql);
});
console.log(`Wrote ${insertSqls.length} insert files`);
