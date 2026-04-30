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
        const finalTables = [];
        let tableCounter = 1;

        // Custom Categories default
        const customNames = ['Sayur', 'Buah', 'Protein', 'Karbo', 'Bumbu & Keringan'];

        // Iterasi setiap sheet
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          if (jsonData.length === 0) return;

          let allRows = [];
          let currentHeaders = [];
          let foundHeader = false;

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            // Cek apakah baris kosong
            const isEmptyRow = row.every(cell => cell === '' || cell === null || cell === undefined || cell.toString().trim() === '');
            if (isEmptyRow) continue; // Lewati baris kosong di tengah data

            const filledCells = row.filter(cell => cell !== '' && cell !== null && cell !== undefined);
            const firstCell = row[0] ? row[0].toString().trim() : '';
            
            const isHeaderRow = firstCell.toUpperCase().includes('NAMA') && filledCells.length > 1;

            if (isHeaderRow && !foundHeader) {
                currentHeaders = row.map(h => h.toString().trim());
                foundHeader = true;
            } else {
                // Semua baris (termasuk judul kategori seperti 'BUAH') masuk sebagai data
                allRows.push(row);
            }
          }

          if (allRows.length > 0) {
            finalTables.push({
              sheetName: sheetName.toUpperCase() === 'SHEET1' ? 'DATA HARIAN' : sheetName,
              tableId: `table_${tableCounter++}`,
              headers: currentHeaders.length > 0 ? currentHeaders : ['Nama Barang', 'JUMLAH', 'HARGA SATUAN', 'SUB TOTAL'],
              rows: allRows
            });
          }
        });

        resolve(finalTables);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
