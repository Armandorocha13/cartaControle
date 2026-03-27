const xlsx = require('xlsx');
const fs = require('fs');

try {
    const workbook = xlsx.readFile('C:/Users/mando/Desktop/cartaControle/FORÇA.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    
    // We want to see the column names first to know how to map
    console.log("COLUNAS:", Object.keys(rows[0] || {}));
    
    // List some rows to understand the structure
    console.log("AMOSTRA:", JSON.stringify(rows.slice(0, 10), null, 2));
} catch (e) {
    console.error("ERRO:", e.message);
}
