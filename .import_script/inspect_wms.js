const xlsx = require('xlsx');

const file = '../HISTORICO VOLANTE WMS/VOLANTE WMS  - 23.03.2026.xlsx';
console.log(`Inspecting file: ${file}`);
const workbook = xlsx.readFile(file);
workbook.SheetNames.forEach(sheetName => {
    console.log(`Sheet: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    if (data.length > 0) {
        let headers = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i] && data[i].some(v => v !== null && v !== '')) {
                headers = data[i];
                console.log(`Columns:`, headers);
                console.log(`First row data:`, data[i+1]);
                break;
            }
        }
        console.log(`Row count:`, data.length);
    }
});
