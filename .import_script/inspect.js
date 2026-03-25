const xlsx = require('xlsx');
const fs = require('fs');

const files = ['../FORÇA.xlsx', '../PARAMETROS KITS.xlsx'];

files.forEach(file => {
    console.log(`\nInspecting file: ${file}`);
    try {
        const workbook = xlsx.readFile(file);
        workbook.SheetNames.forEach(sheetName => {
            console.log(`Sheet: ${sheetName}`);
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
            if (data.length > 0) {
                console.log(`Columns:`, data[0]);
                console.log(`First row:`, data[1]);
                console.log(`Row count:`, data.length);
            }
        });
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});
