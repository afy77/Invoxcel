/**
 * tableEditor.js
 * Bertanggung jawab untuk mode edit tabel (contenteditable, tambah/hapus baris/kolom).
 */

// Menyimpan status edit per tabel
export const editStates = {};

export function toggleEditMode(tableId, globalState) {
  const tableEl = document.getElementById(tableId);
  const cardEl = document.getElementById(`card_${tableId}`);
  if (!tableEl || !cardEl) return;

  const isEditing = editStates[tableId] || false;
  editStates[tableId] = !isEditing;

  const tdCells = tableEl.querySelectorAll('td:not(.action-col)');
  const thContents = tableEl.querySelectorAll('th:not(.action-col) .header-content');
  const actionCols = tableEl.querySelectorAll('.action-col');
  const colActionBtns = tableEl.querySelectorAll('.col-action-btn');
  const addRowContainer = cardEl.querySelector('.add-row-container');
  const editBtn = cardEl.querySelector('.btn-edit-mode');
  const editText = editBtn ? editBtn.querySelector('.btn-edit-text') : null;
  const editIcon = editBtn ? editBtn.querySelector('.icon-edit') : null;

  if (!isEditing) {
    tdCells.forEach(cell => {
      cell.setAttribute('contenteditable', 'true');
      cell.classList.add('bg-yellow-50', 'outline-blue-400');
    });
    thContents.forEach(cell => {
      cell.setAttribute('contenteditable', 'true');
      cell.classList.add('bg-yellow-50', 'outline-blue-400', 'px-1', 'rounded');
    });
    
    // Tampilkan kolom aksi & tombol hapus saat mode edit
    const actionCols = tableEl.querySelectorAll('.action-col');
    const rowDeleteBtns = tableEl.querySelectorAll('.row-delete-btn');
    const columnDeleteBtns = tableEl.querySelectorAll('.col-action-btn');
    
    actionCols.forEach(col => col.classList.remove('hidden'));
    rowDeleteBtns.forEach(btn => {
      btn.classList.remove('hidden');
      btn.classList.add('flex');
    });
    columnDeleteBtns.forEach(btn => {
      btn.classList.remove('hidden');
      btn.classList.add('flex');
    });

    if (addRowContainer) addRowContainer.classList.remove('hidden');
    if (editText) {
      editText.textContent = 'Tutup Edit';
      editBtn.classList.replace('text-indigo-700', 'text-slate-600');
      editBtn.classList.replace('bg-indigo-50/80', 'bg-slate-100');
      editBtn.classList.replace('border-indigo-100/50', 'border-slate-200');
      if (editIcon) editIcon.innerHTML = `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`;
    }
  } else {
    // Simpan perubahan dan nonaktifkan mode edit
    tdCells.forEach(cell => {
      cell.removeAttribute('contenteditable');
      cell.classList.remove('bg-yellow-50', 'outline-blue-400');
    });
    thContents.forEach(cell => {
      cell.removeAttribute('contenteditable');
      cell.classList.remove('bg-yellow-50', 'outline-blue-400', 'px-1', 'rounded');
    });
    
    // Sembunyikan kembali kolom aksi & tombol hapus setelah simpan
    const actionCols = tableEl.querySelectorAll('.action-col');
    const rowDeleteBtns = tableEl.querySelectorAll('.row-delete-btn');
    const columnDeleteBtns = tableEl.querySelectorAll('.col-action-btn');
    
    actionCols.forEach(col => col.classList.add('hidden'));
    rowDeleteBtns.forEach(btn => {
      btn.classList.add('hidden');
      btn.classList.remove('flex');
    });
    columnDeleteBtns.forEach(btn => {
      btn.classList.add('hidden');
      btn.classList.remove('flex');
    });

    if (addRowContainer) addRowContainer.classList.add('hidden');
    if (editText) {
      editText.textContent = 'Edit';
      editBtn.classList.replace('text-slate-600', 'text-indigo-700');
      editBtn.classList.replace('bg-slate-100', 'bg-indigo-50/80');
      editBtn.classList.replace('border-slate-200', 'border-indigo-100/50');
      if (editIcon) editIcon.innerHTML = `<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>`;
    }
  }
}

export function showSaveBtn(tableId) {
  const cardEl = document.getElementById(`card_${tableId}`);
  if (cardEl) {
    const btnSave = cardEl.querySelector('.btn-save-changes');
    if (btnSave) {
      btnSave.classList.remove('hidden');
      btnSave.classList.add('flex');
    }
  }
}

export function addRow(tableId, globalState, position = 'bottom', relativeRowIndex = null) {
  const tableEl = document.getElementById(tableId);
  if (!tableEl) return;

  const tbody = tableEl.querySelector('tbody');
  const headerCount = tableEl.querySelectorAll('thead th:not(.action-col)').length;
  
  const tr = document.createElement('tr');
  // Temporary row index, will be sanitized during saveTableState
  const newRowIndex = Date.now(); 
  tr.dataset.rowIndex = newRowIndex;

  for (let i = 0; i < headerCount; i++) {
    const td = document.createElement('td');
    td.className = 'px-4 py-2 border border-gray-300 text-gray-600 bg-yellow-50 outline-blue-400';
    td.setAttribute('contenteditable', 'true');
    tr.appendChild(td);
  }

  const tdAction = document.createElement('td');
  tdAction.className = 'px-4 py-2 border border-gray-300 action-col';
  
  const actionWrapper = document.createElement('div');
  actionWrapper.className = 'flex items-center justify-center gap-3';

  const btnDeleteRow = document.createElement('button');
  btnDeleteRow.className = 'text-red-500 hover:text-red-700 text-sm font-medium row-delete-btn hidden items-center gap-1 shrink-0';
  btnDeleteRow.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
    Hapus
  `;
  btnDeleteRow.onclick = (e) => {
    e.target.closest('tr').remove();
    if (globalState && tableId) {
      saveTableState(tableId, globalState);
    }
  };
  actionWrapper.appendChild(btnDeleteRow);
  tdAction.appendChild(actionWrapper);
  tr.appendChild(tdAction);

  if (position === 'top') {
    tbody.prepend(tr);
  } else if (position === 'above' && relativeRowIndex !== null) {
    const relativeRow = tbody.querySelector(`tr[data-row-index="${relativeRowIndex}"]`);
    if (relativeRow) tbody.insertBefore(tr, relativeRow);
    else tbody.appendChild(tr);
  } else if (position === 'below' && relativeRowIndex !== null) {
    const relativeRow = tbody.querySelector(`tr[data-row-index="${relativeRowIndex}"]`);
    if (relativeRow && relativeRow.nextSibling) tbody.insertBefore(tr, relativeRow.nextSibling);
    else tbody.appendChild(tr);
  } else {
    tbody.appendChild(tr);
  }
}



export function deleteColumn(tableId, colIndex, globalState) {
  saveTableState(tableId, globalState);
  const tableData = globalState.tables.find(t => t.tableId === tableId);
  if (!tableData) return;

  tableData.headers.splice(colIndex, 1);
  tableData.rows.forEach(row => row.splice(colIndex, 1));
}

export function addColumn(tableId, globalState) {
  saveTableState(tableId, globalState);
  const tableData = globalState.tables.find(t => t.tableId === tableId);
  if (!tableData) return;

  tableData.headers.push('Kolom Baru');
  tableData.rows.forEach(row => row.push(''));
}

export function removeEmptyColumns(tableId, globalState) {
  saveTableState(tableId, globalState);
  const tableData = globalState.tables.find(t => t.tableId === tableId);
  if (!tableData) return;

  const colsToRemove = [];
  for (let c = 0; c < tableData.headers.length; c++) {
    let isEmpty = true;
    
    // Check if header is empty
    if (tableData.headers[c] && tableData.headers[c].trim() !== '') {
      isEmpty = false;
    }

    // Check if all rows are empty for this column
    if (isEmpty) {
      for (let r = 0; r < tableData.rows.length; r++) {
        if (tableData.rows[r][c] && tableData.rows[r][c].toString().trim() !== '') {
          isEmpty = false;
          break;
        }
      }
    }

    if (isEmpty) {
      colsToRemove.push(c);
    }
  }

  // Remove from right to left to avoid index shifting
  for (let i = colsToRemove.length - 1; i >= 0; i--) {
    const c = colsToRemove[i];
    tableData.headers.splice(c, 1);
    tableData.rows.forEach(row => row.splice(c, 1));
  }
}

export function saveTableState(tableId, globalState) {
  const tableEl = document.getElementById(tableId);
  if (!tableEl) return;

  const tableData = globalState.tables.find(t => t.tableId === tableId);
  if (!tableData) return;

  // Helper formatting rupiah
  const toRupiah = (val) => {
    if (val === undefined || val === null || val === '') return '';
    // Strip everything except digits
    const cleaned = val.toString().replace(/[^0-9]/g, '');
    const number = parseInt(cleaned, 10);
    if (isNaN(number)) return val;
    return 'Rp ' + number.toLocaleString('id-ID');
  };

  // Helper formatting qty
  const toQty = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const cleaned = val.toString().replace(/[^0-9]/g, '');
    const number = parseInt(cleaned, 10);
    if (isNaN(number)) return val;
    return number.toLocaleString('id-ID');
  };

  // Extract dynamic headers from UI
  const headerContents = tableEl.querySelectorAll('thead th:not(.action-col) .header-content');
  tableData.headers = Array.from(headerContents).map(div => div.textContent.trim());

  // Update rows
  const rows = tableEl.querySelectorAll('tbody tr');
  tableData.rows = Array.from(rows).map((tr, idx) => {
    // Reset dataset index for consistency after DOM manipulation
    tr.dataset.rowIndex = idx; 
    const cells = tr.querySelectorAll('td:not(.action-col)');
    return Array.from(cells).map((td, colIdx) => {
      let val = td.textContent.trim();
      
      if (colIdx === 0 && val) {
        val = val.toUpperCase();
        if (td.textContent !== val) td.textContent = val;
      } else if (colIdx === 1) {
        val = toQty(val);
        if (td.textContent !== val) td.textContent = val;
      } else if (colIdx === 2 || colIdx === 3) {
        val = toRupiah(val);
        // Update the DOM as well for immediate feedback
        if (td.textContent !== val) td.textContent = val;
      }
      
      return val;
    });
  });
}
