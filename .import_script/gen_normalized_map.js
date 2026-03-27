const xlsx = require('xlsx');
const fs = require('fs');

const normStr = (s) => String(s || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

const workbook = xlsx.readFile('../FORÇA.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);
const mapping = {};
rows.forEach(row => {
    const tec = normStr(row['Nome da Equipe']);
    const sup = String(row['Supervisor2'] || '').trim().toUpperCase();
    if (tec && sup) mapping[tec] = sup;
});

let out = "const TEC_SUP_MAP = {\n";
Object.keys(mapping).sort().forEach(k => {
    out += `  "${k}": "${mapping[k]}",\n`;
});
out += "};\n";

fs.writeFileSync('normalized_map.js.txt', out);
console.log(`Generated ${Object.keys(mapping).length} normalized mappings.`);
