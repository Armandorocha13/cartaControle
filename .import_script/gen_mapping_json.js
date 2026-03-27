const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('../FORÇA.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);
const mapping = {};
rows.forEach(row => {
    const tec = String(row['Nome da Equipe'] || '').trim().toUpperCase();
    const sup = String(row['Supervisor2'] || '').trim().toUpperCase();
    if (tec && sup) mapping[tec] = sup;
});

fs.writeFileSync('mapping.json', JSON.stringify(mapping, null, 2));
console.log(`Saved ${Object.keys(mapping).length} technicians to mapping.json.`);
