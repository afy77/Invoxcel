/**
 * tableRenderer.js
 * Bertanggung jawab untuk merender tabel ke dalam DOM.
 */

export function renderTables(tables, containerId, actions) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = ''; // Bersihkan container

  if (tables.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Tidak ada tabel yang ditemukan.</p>';
    return;
  }

  tables.forEach((table, index) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-3xl shadow-xl shadow-indigo-100/40 border border-slate-200 overflow-hidden mb-8 transition-all hover:shadow-2xl hover:shadow-indigo-100/50';
    card.id = `card_${table.tableId}`;

    // Header Card
    const cardHeader = document.createElement('div');
    cardHeader.className = 'px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold text-gray-800';
    title.textContent = `Tabel ${index + 1}: ${table.sheetName}`;
    
    const actionGroup = document.createElement('div');
    actionGroup.className = 'flex gap-2';

    // Tombol Edit
    const btnEdit = document.createElement('button');
    btnEdit.className = 'px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50/80 border border-indigo-100/50 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-1.5 btn-edit-mode';
    btnEdit.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" class="icon-edit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      <span class="btn-edit-text">Edit</span>
    `;
    btnEdit.onclick = () => actions.onEdit(table.tableId);

    // Tombol Simpan
    const btnSave = document.createElement('button');
    btnSave.className = 'px-4 py-2 text-sm font-semibold text-white bg-green-500 border border-green-600 rounded-xl hover:bg-green-600 transition-all hidden items-center gap-1.5 btn-save-changes shadow-sm';
    btnSave.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      Simpan
    `;
    btnSave.onclick = () => actions.onSave(table.tableId);

    // Tombol Create Invoice
    const btnInvoice = document.createElement('button');
    btnInvoice.className = 'px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-sm shadow-emerald-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5';
    btnInvoice.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
      Create Invoice
    `;
    btnInvoice.onclick = () => actions.onCreateInvoice(table.tableId);

    // Tombol Hapus Tabel
    const btnDeleteTable = document.createElement('button');
    btnDeleteTable.className = 'px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50/80 border border-rose-100/50 rounded-xl hover:bg-rose-100 transition-all flex items-center gap-1.5';
    btnDeleteTable.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      Hapus Tabel
    `;
    btnDeleteTable.onclick = () => {
      if (confirm('Apakah Anda yakin ingin menghapus tabel ini?')) {
        actions.onDeleteTable(table.tableId);
      }
    };

    actionGroup.append(btnSave, btnEdit, btnInvoice, btnDeleteTable);
    cardHeader.append(title, actionGroup);

    // Body Card (Table Container)
    const cardBody = document.createElement('div');
    cardBody.className = 'overflow-x-auto p-6';
    cardBody.id = `container_${table.tableId}`;

    // Tabel Element
    const tableEl = document.createElement('table');
    tableEl.className = 'w-full text-left border-collapse';
    tableEl.id = table.tableId;

    // Thead
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    table.headers.forEach((headerText, colIndex) => {
      const th = document.createElement('th');
      th.className = 'px-4 py-3.5 border border-slate-200 bg-slate-50 font-bold text-slate-700 relative group uppercase text-xs tracking-wider';
      
      const div = document.createElement('div');
      div.className = 'header-content min-h-[1.5rem]';
      div.textContent = headerText;
      th.appendChild(div);

      const btnDeleteCol = document.createElement('button');
      btnDeleteCol.className = 'absolute top-1 right-1 text-red-500 hover:text-red-700 text-xs font-medium hidden col-action-btn';
      btnDeleteCol.innerHTML = '✕';
      btnDeleteCol.title = 'Hapus Kolom';
      btnDeleteCol.onclick = () => actions.onDeleteColumn(table.tableId, colIndex);
      th.appendChild(btnDeleteCol);

      headerRow.appendChild(th);
    });
    
    // Kolom aksi (hidden by default, shown in edit mode)
    const thAction = document.createElement('th');
    thAction.className = 'px-4 py-3 border border-gray-300 bg-gray-100 font-semibold text-gray-700 action-col hidden';
    thAction.textContent = 'Aksi';
    headerRow.appendChild(thAction);

    thead.appendChild(headerRow);

    // Tbody
    const tbody = document.createElement('tbody');
    table.rows.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = rowIndex;
      
      // Pastikan jumlah sel sama dengan header
      for (let i = 0; i < table.headers.length; i++) {
        const td = document.createElement('td');
        td.className = 'px-4 py-3 border border-slate-200 text-slate-600 font-medium';
        td.textContent = row[i] !== undefined ? row[i] : '';
        tr.appendChild(td);
      }

      // Kolom aksi (hidden by default)
      const tdAction = document.createElement('td');
      tdAction.className = 'px-4 py-2 border border-gray-300 action-col hidden';
      
      const actionWrapper = document.createElement('div');
      actionWrapper.className = 'flex items-center justify-center gap-3';
      
      const btnRowInvoice = document.createElement('button');
      btnRowInvoice.className = 'text-emerald-600 hover:text-emerald-800 text-sm font-bold flex items-center gap-1 shrink-0 px-2 py-1 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors';
      btnRowInvoice.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        Invoice
      `;
      btnRowInvoice.onclick = () => actions.onCreateRowInvoice(table.tableId, rowIndex);

      const btnDelete = document.createElement('button');
      btnDelete.className = 'text-rose-500 hover:text-rose-700 text-sm font-bold hidden row-delete-btn items-center gap-1 shrink-0 px-2 py-1 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors';
      btnDelete.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        Hapus
      `;
      btnDelete.onclick = (e) => actions.onDeleteRow(table.tableId, e.target.closest('tr'));
      
      actionWrapper.append(btnRowInvoice, btnDelete);
      tdAction.appendChild(actionWrapper);
      tr.appendChild(tdAction);

      tbody.appendChild(tr);
    });

    tableEl.append(thead, tbody);

    // Listener untuk mendeteksi perubahan ketikan dan memunculkan tombol Simpan
    tableEl.addEventListener('input', () => {
      if (actions.onTableChanged) {
        actions.onTableChanged(table.tableId);
      }
    });

    cardBody.appendChild(tableEl);

    // Tombol Tambah Baris & Hapus Kolom Kosong (hidden by default)
    const addRowContainer = document.createElement('div');
    addRowContainer.className = 'mt-4 add-row-container hidden flex flex-wrap gap-3 items-center';
    
    const btnAddRowTop = document.createElement('button');
    btnAddRowTop.className = 'px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2';
    btnAddRowTop.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
      Baris Atas
    `;
    btnAddRowTop.onclick = () => actions.onAddRow(table.tableId, 'top');

    const btnAddRowBottom = document.createElement('button');
    btnAddRowBottom.className = 'px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2';
    btnAddRowBottom.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 4 4 4-4"/><path d="M12 8v8"/></svg>
      Baris Bawah
    `;
    btnAddRowBottom.onclick = () => actions.onAddRow(table.tableId, 'bottom');
    
    const btnAddColumn = document.createElement('button');
    btnAddColumn.className = 'px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2';
    btnAddColumn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>
      Tambah Kolom
    `;
    btnAddColumn.onclick = () => actions.onAddColumn(table.tableId);
    
    const btnRemoveEmptyCols = document.createElement('button');
    btnRemoveEmptyCols.className = 'px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-2';
    btnRemoveEmptyCols.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
      Hapus Kolom Kosong
    `;
    btnRemoveEmptyCols.onclick = () => actions.onRemoveEmptyColumns(table.tableId);

    addRowContainer.append(btnAddRowTop, btnAddRowBottom, btnAddColumn, btnRemoveEmptyCols);
    cardBody.appendChild(addRowContainer);

    card.append(cardHeader, cardBody);
    container.appendChild(card);
  });
}
