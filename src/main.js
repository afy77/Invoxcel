/**
 * main.js
 * Entry point aplikasi. Menghubungkan semua module.
 */
import './index.css';
import { initFileHandler } from './fileHandler.js';
import { parseExcelFile } from './tableParser.js';
import { renderTables } from './tableRenderer.js';
import { toggleEditMode, addRow, addColumn, deleteColumn, removeEmptyColumns, editStates, saveTableState } from './tableEditor.js';
import { initStyleController } from './styleController.js';
import { printTable } from './printManager.js';
import { exportToPdf } from './pdfExporter.js';

// Global State Sederhana
const globalState = {
  tables: [] // Menyimpan data tabel yang sedang aktif
};

const storageKey  = 'invoxcel_tables';
const timestampKey = 'invoxcel_timestamp';
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

function saveToLocalStorage() {
  localStorage.setItem(storageKey, JSON.stringify(globalState.tables));
  localStorage.setItem(timestampKey, Date.now().toString());
}

function loadFromLocalStorage() {
  const savedTime = localStorage.getItem(timestampKey);
  const now = Date.now();

  // Cek apakah data sudah lebih dari 24 jam
  if (savedTime && (now - parseInt(savedTime, 10) > EXPIRATION_TIME)) {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(timestampKey);
    localStorage.removeItem('excelTableManager_tables');
    console.log('Data lokal dihapus karena sudah melebihi 24 jam.');
    return false;
  }

  const saved = localStorage.getItem(storageKey) || localStorage.getItem('excelTableManager_tables');
  if (saved) {
    try {
      const parsedTables = JSON.parse(saved);
      const formatQty = (val) => {
        if (val === undefined || val === null || val === '') return '';
        const cleaned = val.toString().replace(/[^0-9]/g, '');
        const number = parseInt(cleaned, 10);
        if (isNaN(number)) return val;
        return number.toLocaleString('id-ID');
      };

      // Migrate headers for existing tables
      parsedTables.forEach(table => {
        if (table.headers) {
          if (table.headers[1] && table.headers[1].toUpperCase() === 'QTY') table.headers[1] = 'JUMLAH';
          if (table.headers[2] && table.headers[2].toUpperCase() === 'HARGA') table.headers[2] = 'HARGA SATUAN';
          if (table.headers[3] && table.headers[3].toUpperCase() === 'JUMLAH') table.headers[3] = 'SUB TOTAL';
        }
        if (table.rows) {
          table.rows.forEach(row => {
            if (row[0] && typeof row[0] === 'string') row[0] = row[0].toUpperCase();
            if (row[1] !== undefined) row[1] = formatQty(row[1]);
          });
        }
      });
      globalState.tables = parsedTables;
      // Migrate old data key to new key / update timestamp on next save
      if (!localStorage.getItem(storageKey) || !savedTime) {
        saveToLocalStorage();
      }
      return true;
    } catch (e) {
      console.error('Failed to parse saved tables', e);
      return false;
    }
  }
  return false;
}

document.addEventListener('DOMContentLoaded', () => {
  
  const renderAll = () => {
    renderTables(globalState.tables, 'tablesContainer', {
      onEdit: (tableId) => {
        const isEditing = editStates[tableId] || false;
        if (!isEditing) {
          // Entering edit mode: Create backup of the table
          globalState.tableBackups = globalState.tableBackups || {};
          const tableData = globalState.tables.find(t => t.tableId === tableId);
          if (tableData) {
            globalState.tableBackups[tableId] = JSON.parse(JSON.stringify(tableData));
          }
          toggleEditMode(tableId, globalState);
        } else {
          // Cancelling edit mode: Restore from backup
          if (globalState.tableBackups && globalState.tableBackups[tableId]) {
            const idx = globalState.tables.findIndex(t => t.tableId === tableId);
            if (idx !== -1) {
              globalState.tables[idx] = globalState.tableBackups[tableId];
            }
            delete globalState.tableBackups[tableId];
          }
          editStates[tableId] = false;
          renderAll(); // Re-render to clear unsaved visual changes
        }
      },
      onSave: (tableId) => {
        saveTableState(tableId, globalState); // Sync contenteditable to globalState
        saveToLocalStorage(); // Commit
        if (globalState.tableBackups) delete globalState.tableBackups[tableId];
        editStates[tableId] = false;
        renderAll(); // Rebuild final UI
      },
      onTableChanged: (tableId) => {
        const cardEl = document.getElementById(`card_${tableId}`);
        if (cardEl) {
          const btnSave = cardEl.querySelector('.btn-save-changes');
          if (btnSave) {
            btnSave.classList.remove('hidden');
            btnSave.classList.add('flex');
          }
        }
      },
      onAddRow: (tableId, position = 'bottom') => {
        addRow(tableId, globalState, position);
        saveTableState(tableId, globalState); // Save draft
        renderAll();
        editStates[tableId] = false;
        toggleEditMode(tableId, globalState);
        const cardEl = document.getElementById(`card_${tableId}`);
        if (cardEl) cardEl.querySelector('.btn-save-changes')?.classList.replace('hidden', 'flex');
      },
      onDeleteRow: (tableId, rowEl) => {
        rowEl.remove();
        saveTableState(tableId, globalState); // Save draft
        const cardEl = document.getElementById(`card_${tableId}`);
        if (cardEl) cardEl.querySelector('.btn-save-changes')?.classList.replace('hidden', 'flex');
      },
      onDeleteColumn: (tableId, colIndex) => {
        deleteColumn(tableId, colIndex, globalState);
        renderAll();
        editStates[tableId] = false;
        toggleEditMode(tableId, globalState);
        const cardEl = document.getElementById(`card_${tableId}`);
        if (cardEl) cardEl.querySelector('.btn-save-changes')?.classList.replace('hidden', 'flex');
      },
      onAddColumn: (tableId) => {
        addColumn(tableId, globalState);
        renderAll();
        editStates[tableId] = false;
        toggleEditMode(tableId, globalState);
        const cardEl = document.getElementById(`card_${tableId}`);
        if (cardEl) cardEl.querySelector('.btn-save-changes')?.classList.replace('hidden', 'flex');
      },
      onRemoveEmptyColumns: (tableId) => {
        removeEmptyColumns(tableId, globalState);
        renderAll();
        editStates[tableId] = false;
        toggleEditMode(tableId, globalState);
        const cardEl = document.getElementById(`card_${tableId}`);
        if (cardEl) cardEl.querySelector('.btn-save-changes')?.classList.replace('hidden', 'flex');
      },
      onPrint: (tableId) => printTable(tableId),
      onPdf: (tableId) => {
        const tableData = globalState.tables.find(t => t.tableId === tableId);
        if (tableData) exportToPdf(tableId, tableData.sheetName);
      },
      onCreateInvoice: (tableId) => {
        const tableData = globalState.tables.find(t => t.tableId === tableId);
        if (tableData) {
          sessionStorage.setItem('invoiceData', JSON.stringify(tableData));
          window.location.href = '/invoice.html';
        }
      },
      onCreateRowInvoice: (tableId, rowIndex) => {
        const tableData = globalState.tables.find(t => t.tableId === tableId);
        if (tableData && tableData.rows[rowIndex]) {
          // Buat salinan data tabel tapi hanya berisi 1 baris yang dipilih
          const singleRowData = {
            ...tableData,
            rows: [tableData.rows[rowIndex]],
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                // Jangan bawa metadata invoice lama agar tidak bentrok
            invoiceMeta: {} 
          };
          sessionStorage.setItem('invoiceData', JSON.stringify(singleRowData));
          window.location.href = '/invoice.html';
        }
      },
      onDeleteTable: (tableId) => {
        globalState.tables = globalState.tables.filter(t => t.tableId !== tableId);
        saveToLocalStorage();
        renderAll();
      }
    });
  };

  // Load saved data if exists
  if (loadFromLocalStorage() && globalState.tables.length > 0) {
    renderAll();
  }

  // Inisialisasi File Handler
  initFileHandler('dropZone', 'fileInput', async (file) => {
    try {
      showLoading(true);
      // Parse file Excel
      let newTables = await parseExcelFile(file);

      // Helper formatting rupiah
      const toRupiah = (val) => {
        if (val === undefined || val === null || val === '') return '';
        const cleaned = val.toString().replace(/[^0-9]/g, '');
        const number = parseInt(cleaned, 10);
        if (isNaN(number)) return val;
        return 'Rp ' + number.toLocaleString('id-ID');
      };
      const toQty = (val) => {
        if (val === undefined || val === null || val === '') return '';
        const cleaned = val.toString().replace(/[^0-9]/g, '');
        const number = parseInt(cleaned, 10);
        if (isNaN(number)) return val;
        return number.toLocaleString('id-ID');
      };
      
      // HARDCODE: Enforce standard headers and format rows for ALL tables
      newTables = newTables.map(table => {
        return {
          ...table,
          headers: ['Nama Barang', 'JUMLAH', 'HARGA SATUAN', 'SUB TOTAL'],
          rows: table.rows.map(row => {
            const newRow = [...row];
            if (newRow[0] !== undefined && typeof newRow[0] === 'string') newRow[0] = newRow[0].toUpperCase();
            if (newRow[1] !== undefined) newRow[1] = toQty(newRow[1]);
            if (newRow[2] !== undefined) newRow[2] = toRupiah(newRow[2]);
            if (newRow[3] !== undefined) newRow[3] = toRupiah(newRow[3]);
            return newRow;
          })
        };
      });
      
      // Replace existing tables with new ones
      globalState.tables = newTables;
      saveToLocalStorage();
      
      // Render tabel
      renderAll();
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat memproses file Excel.');
    } finally {
      showLoading(false);
    }
  });
});

function showLoading(isLoading) {
  const loader = document.getElementById('loadingIndicator');
  if (loader) {
    if (isLoading) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
  }
}
