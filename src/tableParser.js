/**
 * tableParser.js
 * Bertanggung jawab untuk membaca file Excel dan mengekstrak data tabel.
 */
import * as XLSX from 'xlsx';

export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const tables = [];
        let tableCounter = 1;

        // Iterasi setiap sheet
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          
          // Konversi sheet ke array of arrays (2D array)
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          if (jsonData.length === 0) return;

          // Deteksi area data (tabel)
          // Jika dalam satu sheet ada multiple tabel terpisah, pisahkan berdasarkan baris kosong
          
          let currentTableRows = [];
          let currentHeaders = [];
          let isHeader = true;

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const isEmptyRow = row.every(cell => cell === '' || cell === null || cell === undefined);

            if (isEmptyRow) {
              if (currentTableRows.length > 0 || currentHeaders.length > 0) {
                const customNames = ['Sayur', 'Buah', 'Protein', 'Karbo', 'Bumbu & Keringan'];
                const templateName = tableCounter <= customNames.length ? customNames[tableCounter - 1] : sheetName;
                tables.push({
                  sheetName: templateName,
                  tableId: `table_${tableCounter++}`,
                  headers: currentHeaders,
                  rows: currentTableRows
                });
                currentTableRows = [];
                currentHeaders = [];
                isHeader = true;
              }
            } else {
              if (isHeader) {
                currentHeaders = row;
                isHeader = false;
              } else {
                currentTableRows.push(row);
              }
            }
          }

          // Push tabel terakhir jika ada
          if (currentTableRows.length > 0 || currentHeaders.length > 0) {
            const customNames = ['Sayur', 'Buah', 'Protein', 'Karbo', 'Bumbu & Keringan'];
            const templateName = tableCounter <= customNames.length ? customNames[tableCounter - 1] : sheetName;
            tables.push({
              sheetName: templateName,
              tableId: `table_${tableCounter++}`,
              headers: currentHeaders,
              rows: currentTableRows
            });
          }
        });

        resolve(tables);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
