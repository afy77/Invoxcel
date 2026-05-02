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
        const customNames = ['SAYUR', 'BUAH', 'PROTEIN', 'KARBOHIDRAT', 'BUMBU & KERINGAN'];

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          if (jsonData.length === 0) return;

          let currentTableName = '';
          let currentHeaders = ['Nama Barang', 'JUMLAH', 'HARGA SATUAN', 'SUB TOTAL'];
          let currentTableRows = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            // Cek apakah baris kosong
            const isEmptyRow = row.every(cell => cell === '' || cell === null || cell === undefined || cell.toString().trim() === '');
            if (isEmptyRow) continue;

            const filledCells = row.filter(cell => cell !== '' && cell !== null && cell !== undefined);
            const firstCell = row[0] ? row[0].toString().trim() : '';
            
            const isHeaderRow = firstCell.toUpperCase().includes('NAMA') && filledCells.length > 1;
            const isTitleRow = filledCells.length === 1 && firstCell !== '';

            if (isHeaderRow || isTitleRow) {
                // Jika sudah ada data, simpan tabel sebelumnya
                if (currentTableRows.length > 0) {
                    finalTables.push({
                        sheetName: currentTableName || (finalTables.length < customNames.length ? customNames[finalTables.length] : `TABEL ${tableCounter}`),
                        tableId: `table_${tableCounter++}`,
                        headers: currentHeaders,
                        rows: currentTableRows
                    });
                    currentTableRows = [];
                    // Reset nama untuk tabel baru kecuali ini baris judul
                    if (isHeaderRow) currentTableName = '';
                }

                if (isTitleRow) {
                    currentTableName = firstCell.toUpperCase();
                } else if (isHeaderRow) {
                    currentHeaders = row.map(h => h.toString().trim());
                }
            } else {
                currentTableRows.push(row);
            }
          }

          // Push tabel terakhir di sheet ini
          if (currentTableRows.length > 0) {
            finalTables.push({
              sheetName: currentTableName || (finalTables.length < customNames.length ? customNames[finalTables.length] : `TABEL ${tableCounter}`),
              tableId: `table_${tableCounter++}`,
              headers: currentHeaders,
              rows: currentTableRows
            });
            currentTableRows = [];
            currentTableName = '';
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
