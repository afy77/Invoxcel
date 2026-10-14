import * as XLSX from 'xlsx';
import './index.css';
import { initFileHandler } from './fileHandler.js';
import { parseExcelFile } from './tableParser.js';
import { renderTables } from './tableRenderer.js';
import { toggleEditMode, addRow, addColumn, deleteColumn, removeEmptyColumns, editStates, saveTableState } from './tableEditor.js';
import { initStyleController } from './styleController.js';
import { printTable } from './printManager.js';
import { exportToPdf } from './pdfExporter.js';
import { initDarkMode } from './darkMode.js';
import { showToast, showConfirm } from './toast.js';
// renderInvoice hanya digunakan di invoice.html, bukan di main.js
import { showLoadingModal, hideLoadingModal } from './loadingModal.js';

// Expose showToast ke window agar bisa diakses di saveToLocalStorage
// tanpa risiko circular import (saveToLocalStorage dipanggil sebelum DOMContentLoaded)
window.__invoxcelToast = { showToast };

// Init Dark Mode on load
initDarkMode();

// Global State Sederhana
const globalState = {
  tables: [], // Menyimpan data tabel yang sedang aktif
  globalInvoiceMeta: {
    customerName: '',
    customerAddress: '',
    date: '',
    dueDate: ''
  }
};

const storageKey  = 'invoxcel_tables';
const timestampKey = 'invoxcel_timestamp';
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

function saveToLocalStorage() {
  // [C-2] Wrap dengan try/catch — localStorage.setItem() bisa throw QuotaExceededError
  // jika storage browser penuh (batas default ~5MB).
  try {
    localStorage.setItem(storageKey, JSON.stringify(globalState.tables));
    localStorage.setItem(timestampKey, Date.now().toString());
    localStorage.setItem('invoxcel_global_meta', JSON.stringify(globalState.globalInvoiceMeta));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      // Tampilkan peringatan — import toast tidak bisa langsung di sini (circular risk)
      // Gunakan console + alert sebagai fallback aman
      console.error('[saveToLocalStorage] Storage penuh:', e);
      const { showToast } = window.__invoxcelToast || {};
      if (typeof showToast === 'function') {
        showToast('Penyimpanan lokal penuh. Beberapa data mungkin tidak tersimpan.', 'error');
      }
    } else {
      console.error('[saveToLocalStorage] Gagal menyimpan:', e);
    }
  }
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

  // Load Global Meta
  const savedGlobalMeta = localStorage.getItem('invoxcel_global_meta');
  if (savedGlobalMeta) {
    try {
      globalState.globalInvoiceMeta = JSON.parse(savedGlobalMeta);
    } catch (e) {
      console.error('Failed to parse global meta', e);
    }
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
          
          if (!table.headers.includes('SATUAN') && table.headers[1] === 'JUMLAH') {
             table.headers.splice(2, 0, 'SATUAN');
             if (table.rows) {
               table.rows.forEach(row => row.splice(2, 0, ''));
             }
          }
          
          const hargaIdx = table.headers.findIndex(h => h.toUpperCase() === 'HARGA' || h.toUpperCase() === 'HARGA SATUAN');
          if (hargaIdx !== -1) table.headers[hargaIdx] = 'HARGA SATUAN';
          
          const subIdx = table.headers.findIndex(h => h.toUpperCase() === 'SUB TOTAL' || (h.toUpperCase() === 'JUMLAH' && h !== table.headers[1]));
          if (subIdx !== -1) table.headers[subIdx] = 'SUB TOTAL';
        }
        if (table.rows) {
          table.rows.forEach(row => {
            if (row[0] && typeof row[0] === 'string') {
              row[0] = row[0].toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            }
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
          updateDOM(); // Re-render to clear unsaved visual changes
        }
      },
      onSave: (tableId) => {
        showLoadingModal('save');
        try {
          saveTableState(tableId, globalState); // Sync contenteditable to globalState
          saveToLocalStorage(); // Commit
          if (globalState.tableBackups) delete globalState.tableBackups[tableId];
          editStates[tableId] = false;
          updateDOM(); // Rebuild final UI
        } catch (err) {
          console.error('[onSave] Gagal menyimpan:', err);
          showToast('Gagal menyimpan perubahan.', 'error');
        } finally {
          hideLoadingModal();
        }
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
        updateDOM(tableId);
      },
      onDeleteRow: (tableId, rowEl) => {
        showConfirm('Apakah Anda yakin ingin menghapus baris ini?', () => {
          rowEl.remove();
          updateDOM();
          showToast('Baris berhasil dihapus');
        });
      },
      onDeleteColumn: (tableId, colIndex) => {
        showConfirm('Apakah Anda yakin ingin menghapus kolom ini? Seluruh data di kolom ini akan hilang.', () => {
          deleteColumn(tableId, colIndex, globalState);
          updateDOM(tableId);
          showToast('Kolom berhasil dihapus');
        });
      },
      onAddColumn: (tableId) => {
        addColumn(tableId, globalState);
        updateDOM(tableId);
      },
      onRemoveEmptyColumns: (tableId) => {
        removeEmptyColumns(tableId, globalState);
        updateDOM(tableId);
      },
      onBulkDelete: (tableId) => {
        const tableEl = document.getElementById(tableId);
        if (!tableEl) return;
        const checked = tableEl.querySelectorAll('.row-checkbox:checked');
        if (checked.length === 0) {
           showToast('Pilih baris yang ingin dihapus terlebih dahulu.', 'error');
           return;
        }
        showConfirm(`Apakah Anda yakin ingin menghapus ${checked.length} baris terpilih?`, () => {
          checked.forEach(cb => {
            const tr = cb.closest('tr');
            if (tr) tr.remove();
          });
          updateDOM();
          showToast(`${checked.length} baris berhasil dihapus`);
        });
      },
      onPrint: (tableId) => {
        saveTableState(tableId, globalState); // Auto-save edits
        printTable(tableId, globalState.globalInvoiceMeta);
      },
      onPdf: async (tableId) => {
        // [H-1] exportToPdf sekarang mengembalikan Promise, sehingga bisa di-await
        // Loading modal tertutup SETELAH PDF benar-benar selesai diproses.
        showLoadingModal('invoice');
        try {
          saveTableState(tableId, globalState); // Auto-save edits
          const tableData = globalState.tables.find(t => t.tableId === tableId);
          if (tableData) await exportToPdf(tableId, tableData.sheetName, globalState.globalInvoiceMeta);
        } catch (err) {
          console.error('[onPdf] Gagal mengekspor PDF:', err);
          showToast('Gagal mengekspor PDF.', 'error');
        } finally {
          hideLoadingModal(); // Tidak perlu setTimeout — await sudah memastikan PDF selesai
        }
      },
      onCreateInvoice: (tableId) => {
        showLoadingModal('invoice');
        try {
          saveTableState(tableId, globalState); // Auto-save edits before creating invoice
          const tableData = globalState.tables.find(t => t.tableId === tableId);
          if (tableData) {
            // Merge global metadata if available and local field is empty
            const localMeta = tableData.invoiceMeta || {};
            const mergedMeta = {
              ...localMeta,
              customerName: localMeta.customerName || globalState.globalInvoiceMeta.customerName,
              customerAddress: localMeta.customerAddress || globalState.globalInvoiceMeta.customerAddress,
              date: localMeta.date || globalState.globalInvoiceMeta.date,
              dueDate: localMeta.dueDate || globalState.globalInvoiceMeta.dueDate
            };

            const finalTableData = {
              ...tableData,
              invoiceMeta: mergedMeta
            };

            sessionStorage.setItem('invoiceData', JSON.stringify(finalTableData));
            // [C-1] FIX: Tidak memanggil hideLoadingModal() di sini.
            // Modal akan hilang otomatis saat halaman unload karena navigasi.
            // Timeout 1600ms (sedikit di atas MIN_DISPLAY_MS=1500ms) memastikan
            // spinner tampil cukup lama sebelum halaman berpindah.
            setTimeout(() => { window.location.href = '/invoice.html'; }, 1600);
          } else {
            hideLoadingModal(); // Tidak ada data — tutup modal
          }
        } catch (err) {
          // Saat error: modal HARUS ditutup agar user bisa berinteraksi lagi
          console.error('[onCreateInvoice] Gagal membuat invoice:', err);
          showToast('Gagal membuat invoice.', 'error');
          hideLoadingModal();
        }
      },
      onCreateRowInvoice: (tableId, rowIndex) => {
        showLoadingModal('invoice');
        try {
          saveTableState(tableId, globalState); // Auto-save edits before creating invoice
          const tableData = globalState.tables.find(t => t.tableId === tableId);
          if (tableData && tableData.rows[rowIndex]) {
            // Merge global metadata
            const localMeta = tableData.invoiceMeta || {};
            const mergedMeta = {
              ...localMeta,
              customerName: localMeta.customerName || globalState.globalInvoiceMeta.customerName,
              customerAddress: localMeta.customerAddress || globalState.globalInvoiceMeta.customerAddress,
              date: localMeta.date || globalState.globalInvoiceMeta.date,
              dueDate: localMeta.dueDate || globalState.globalInvoiceMeta.dueDate
            };

            const singleRowData = {
              ...tableData,
              rows: [tableData.rows[rowIndex]],
              invoiceMeta: mergedMeta
            };
            sessionStorage.setItem('invoiceData', JSON.stringify(singleRowData));
            // [C-1] FIX: Modal tidak di-hide manual saat sukses — navigasi menghapus halaman.
            // Timeout 1600ms > MIN_DISPLAY_MS (1500ms) agar spinner sempat terlihat.
            setTimeout(() => { window.location.href = '/invoice.html'; }, 1600);
          } else {
            hideLoadingModal(); // Tidak ada data baris — tutup modal
          }
        } catch (err) {
          console.error('[onCreateRowInvoice] Gagal membuat invoice:', err);
          showToast('Gagal membuat invoice.', 'error');
          hideLoadingModal();
        }
      },
      onDeleteTable: (tableId) => {
        globalState.tables = globalState.tables.filter(t => t.tableId !== tableId);
        saveToLocalStorage();
        renderAll();
        toggleGlobalMetaVisibility();
        showToast('Tabel berhasil dihapus');
      }
    });
  };

  const updateDOM = (excludeId = null) => {
    // 1. Sync all active edit modes to globalState so we don't lose typed text
    Object.keys(editStates).forEach(id => {
      if (editStates[id] && id !== excludeId) saveTableState(id, globalState);
    });
    
    // 2. Render all tables from globalState
    renderAll();
    
    // 3. Re-apply edit mode visuals for tables that are supposed to be editing
    Object.keys(editStates).forEach(id => {
      if (editStates[id]) {
        editStates[id] = false; // Reset before toggle
        toggleEditMode(id, globalState); // This sets it back to true and updates UI
        const cardEl = document.getElementById(`card_${id}`);
        if (cardEl) cardEl.querySelector('.btn-save-changes')?.classList.replace('hidden', 'flex');
      }
    });
  };

  // Load saved data if exists
  loadFromLocalStorage();
  updateGlobalMetaUI();
  
  if (globalState.tables.length > 0) {
    renderAll();
  }

  // Initial UI state
  toggleGlobalMetaVisibility();

  function toggleGlobalMetaVisibility() {
    const section = document.getElementById('globalMetaSection');
    if (section) {
      if (globalState.tables.length > 0) section.classList.remove('hidden');
      else section.classList.add('hidden');
    }
  }

  function updateGlobalMetaUI() {
    const meta = globalState.globalInvoiceMeta;
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const globalMetaElement = document.getElementById('globalCustomerName');
    if (globalMetaElement) globalMetaElement.value = meta.customerName || '';
    
    const globalCustomerAddress = document.getElementById('globalCustomerAddress');
    if (globalCustomerAddress) globalCustomerAddress.value = meta.customerAddress || '';
    
    const globalDate = document.getElementById('globalDate');
    if (globalDate) globalDate.value = meta.date || today;
    
    // Sync back to state if defaults were used
    if (!meta.date) globalState.globalInvoiceMeta.date = today;
  }

  // Global Meta Listeners
  const globalMetaInputs = ['globalCustomerName', 'globalCustomerAddress', 'globalDate'];
  globalMetaInputs.forEach(id => {
    document.getElementById(id)?.addEventListener('input', (e) => {
      const key = id.replace('global', '').charAt(0).toLowerCase() + id.replace('global', '').slice(1);
      globalState.globalInvoiceMeta[key] = e.target.value;
      saveToLocalStorage();
    });
  });

  document.getElementById('btnPrintAll')?.addEventListener('click', () => {
    if (globalState.tables.length === 0) return showToast('Tidak ada data tabel untuk dicetak.', 'error');
    
    // Merge global metadata if available and local field is empty
    const tablesToPrint = globalState.tables.map(table => {
      const localMeta = table.invoiceMeta || {};
      const mergedMeta = {
        ...localMeta,
        customerName: localMeta.customerName || globalState.globalInvoiceMeta.customerName,
        customerAddress: localMeta.customerAddress || globalState.globalInvoiceMeta.customerAddress,
        date: localMeta.date || globalState.globalInvoiceMeta.date,
        dueDate: localMeta.dueDate || globalState.globalInvoiceMeta.dueDate
      };
      return {
        ...table,
        invoiceMeta: mergedMeta
      };
    });

    // Simpan semua tabel ke sessionStorage
    sessionStorage.setItem('bulkInvoiceData', JSON.stringify(tablesToPrint));
    window.location.href = '/bulk-print.html';
  });

  // Inisialisasi File Handler
  initFileHandler('dropZone', 'fileInput', async (file) => {
    // ── Konteks: Import File ──────────────────────────────────────────────────
    showLoadingModal('import');
    try {
      // Parse file Excel
      let newTables = await parseExcelFile(file);

      // VALIDASI KHUSUS: Cek apakah ada 5 tabel
      if (newTables.length < 5) {
        showToast(`Peringatan: Hanya ditemukan ${newTables.length} tabel. Pastikan Excel memiliki 5 kategori harian.`, 'error');
      }

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
          headers: ['Nama Barang', 'JUMLAH', 'SATUAN', 'HARGA SATUAN', 'SUB TOTAL'],
          rows: table.rows.map(row => {
            const newRow = [...row];
            
            // Cek apakah tabel lama belum punya kolom satuan (hanya 4 kolom yg terisi)
            // Jika index 2 kosong / dianggap harga, dan panjang asal kurang, kita harus menyisipkan satuan
            // Tapi karena row dari excel bisa sembarang, mari asumsikan dari parse Excel (yang membaca 4/5 kolom)
            // Jika row.length = 4 (Nama, Qty, Harga, Subtotal), sisipkan di index 2
            if (newRow.length >= 4 && !newRow[4] && (parseInt(newRow[2]?.toString().replace(/[^0-9]/g, ''), 10) > 100)) {
               // kemungkinan besar index 2 itu Harga
               newRow.splice(2, 0, ''); 
            } else if (newRow.length < 5) {
               newRow.splice(2, 0, '');
            }

            // Auto Calculation logic during import
            const cleanNum = (s) => parseInt(s?.toString().replace(/[^0-9]/g, ''), 10) || 0;
            const qty = cleanNum(newRow[1]);
            const price = cleanNum(newRow[3]);
            const subtotal = qty * price;

            if (newRow[0] !== undefined && typeof newRow[0] === 'string') {
              newRow[0] = newRow[0].toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            }
            newRow[1] = toQty(qty.toString());
            newRow[2] = newRow[2] || '';
            newRow[3] = toRupiah(price.toString());
            newRow[4] = toRupiah(subtotal.toString());
            return newRow;
          })
        };
      });
      
      // Replace existing tables with new ones
      globalState.tables = newTables;
      saveToLocalStorage();
      
      // Render tabel
      toggleGlobalMetaVisibility();
      updateGlobalMetaUI();
      renderAll();
      showToast('File Excel berhasil diproses!');
    } catch (error) {
      console.error('[Import] Terjadi kesalahan:', error);
      showToast('Terjadi kesalahan saat memproses file Excel.', 'error');
    } finally {
      // Selalu tutup modal, bahkan jika terjadi error
      hideLoadingModal();
    }
  });


});

// [L-2] showLoading() lama telah dihapus — sudah digantikan sepenuhnya oleh loadingModal.js
