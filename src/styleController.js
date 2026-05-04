/**
 * styleController.js
 * Bertanggung jawab untuk mengelola styling tabel secara dinamis.
 */

export function initStyleController(panelId, globalState, targetTableId = null) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const targetTable = targetTableId 
    ? globalState.tables.find(t => t.tableId === targetTableId)
    : globalState.tables[0];

  const currentStyles = targetTable?.styles || {};
  const currentHeaders = targetTable?.headers || [];
  const currentColumnAligns = currentStyles.columnAligns || [];

  // Render UI Panel Styling (Compact Sidebar Version)
  panel.innerHTML = `
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-indigo-100/30 dark:shadow-none border border-slate-200 dark:border-slate-700/60 no-print sticky top-8 transition-colors">
      <h3 class="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 uppercase tracking-widest mb-6 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">Desain Tabel</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Template Invoice</label>
          <select id="style_template" class="w-full h-10 text-xs border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 dark:text-slate-200 rounded-xl px-3 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 trasition-all">
            <option value="default" ${currentStyles.template === 'default' ? 'selected' : ''}>Standard (Dengan Garis TTD)</option>
            <option value="default-noline" ${currentStyles.template === 'default-noline' || !currentStyles.template ? 'selected' : ''}>Standard (Tanpa Garis TTD)</option>
            <option value="modern" ${currentStyles.template === 'modern' ? 'selected' : ''}>Modern Minimalis</option>
            <option value="corporate" ${currentStyles.template === 'corporate' ? 'selected' : ''}>Corporate Blue</option>
            <option value="elegant" ${currentStyles.template === 'elegant' ? 'selected' : ''}>Elegant Dark</option>
            <option value="minimalist" ${currentStyles.template === 'minimalist' ? 'selected' : ''}>Clean Minimalist</option>
            <option value="classic" ${currentStyles.template === 'classic' ? 'selected' : ''}>Classic Professional</option>
            <option value="playful" ${currentStyles.template === 'playful' ? 'selected' : ''}>Playful Pastel</option>
            <option value="industrial" ${currentStyles.template === 'industrial' ? 'selected' : ''}>Industrial Dark</option>
            <option value="vibrant" ${currentStyles.template === 'vibrant' ? 'selected' : ''}>Vibrant Colorful</option>
            <option value="receipt" ${currentStyles.template === 'receipt' ? 'selected' : ''}>Retail Receipt</option>
            <option value="luxury" ${currentStyles.template === 'luxury' ? 'selected' : ''}>Luxury Gold</option>
            <option value="tech" ${currentStyles.template === 'tech' ? 'selected' : ''}>Tech Cyberpunk</option>
            <option value="eco" ${currentStyles.template === 'eco' ? 'selected' : ''}>Eco Nature</option>
            <option value="gradient" ${currentStyles.template === 'gradient' ? 'selected' : ''}>Sunset Gradient</option>
            <option value="ocean" ${currentStyles.template === 'ocean' ? 'selected' : ''}>Ocean Breeze</option>
            <option value="monochrome" ${currentStyles.template === 'monochrome' ? 'selected' : ''}>Sleek Monochrome</option>
            <option value="corporate-modern" ${currentStyles.template === 'corporate-modern' ? 'selected' : ''}>Corporate Modern (Perusahaan)</option>
            <option value="nota-kontan" ${currentStyles.template === 'nota-kontan' ? 'selected' : ''}>Nota Kontan (UMKM Klasik)</option>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Warna Header</label>
          <div class="relative w-full h-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 flex items-center px-3 overflow-hidden group hover:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/50 transition-all cursor-pointer">
            <input type="color" id="style_headerBg" value="${currentStyles.headerBg || '#374151'}" class="absolute -left-10 -top-10 opacity-0 w-[200%] h-[200%] cursor-pointer" oninput="this.nextElementSibling.style.backgroundColor = this.value; this.nextElementSibling.nextElementSibling.textContent = this.value.toUpperCase()">
            <div class="w-5 h-5 rounded-full shadow-sm ring-1 ring-black/10 flex-shrink-0 transition-colors" style="background-color: ${currentStyles.headerBg || '#374151'};"></div>
            <span class="ml-3 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 pointer-events-none">${(currentStyles.headerBg || '#374151').toUpperCase()}</span>
          </div>
        </div>
        
        <div>
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Warna Border</label>
          <div class="relative w-full h-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 flex items-center px-3 overflow-hidden group hover:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/50 transition-all cursor-pointer">
            <input type="color" id="style_borderColor" value="${currentStyles.borderColor || '#000000'}" class="absolute -left-10 -top-10 opacity-0 w-[200%] h-[200%] cursor-pointer" oninput="this.nextElementSibling.style.backgroundColor = this.value; this.nextElementSibling.nextElementSibling.textContent = this.value.toUpperCase()">
            <div class="w-5 h-5 rounded-full shadow-sm ring-1 ring-black/10 flex-shrink-0 transition-colors" style="background-color: ${currentStyles.borderColor || '#000000'};"></div>
            <span class="ml-3 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 pointer-events-none">${(currentStyles.borderColor || '#000000').toUpperCase()}</span>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Teks Header</label>
          <div class="relative w-full h-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 flex items-center px-3 overflow-hidden group hover:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/50 transition-all cursor-pointer">
            <input type="color" id="style_headerFontColor" value="${currentStyles.headerFontColor || '#ffffff'}" class="absolute -left-10 -top-10 opacity-0 w-[200%] h-[200%] cursor-pointer" oninput="this.nextElementSibling.style.backgroundColor = this.value; this.nextElementSibling.nextElementSibling.textContent = this.value.toUpperCase()">
            <div class="w-5 h-5 rounded-full shadow-sm ring-1 ring-black/10 flex-shrink-0 transition-colors" style="background-color: ${currentStyles.headerFontColor || '#ffffff'};"></div>
            <span class="ml-3 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 pointer-events-none">${(currentStyles.headerFontColor || '#ffffff').toUpperCase()}</span>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Teks Sel</label>
          <div class="relative w-full h-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 flex items-center px-3 overflow-hidden group hover:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/50 transition-all cursor-pointer">
            <input type="color" id="style_cellFontColor" value="${currentStyles.cellFontColor || '#000000'}" class="absolute -left-10 -top-10 opacity-0 w-[200%] h-[200%] cursor-pointer" oninput="this.nextElementSibling.style.backgroundColor = this.value; this.nextElementSibling.nextElementSibling.textContent = this.value.toUpperCase()">
            <div class="w-5 h-5 rounded-full shadow-sm ring-1 ring-black/10 flex-shrink-0 transition-colors" style="background-color: ${currentStyles.cellFontColor || '#000000'};"></div>
            <span class="ml-3 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 pointer-events-none">${(currentStyles.cellFontColor || '#000000').toUpperCase()}</span>
          </div>
        </div>
        
        <div>
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Gaya Font</label>
          <select id="style_fontFamily" class="w-full h-10 text-xs border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 dark:text-slate-200 rounded-xl px-3 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 trasition-all">
            <option value="'Inter', sans-serif" ${currentStyles.fontFamily?.includes('Inter') ? 'selected' : ''}>Inter (Minimalist)</option>
            <option value="'Poppins', sans-serif" ${currentStyles.fontFamily?.includes('Poppins') ? 'selected' : ''}>Poppins (Modern Round)</option>
            <option value="'Roboto', sans-serif" ${currentStyles.fontFamily?.includes('Roboto') ? 'selected' : ''}>Roboto (Professional)</option>
            <option value="'Montserrat', sans-serif" ${currentStyles.fontFamily?.includes('Montserrat') ? 'selected' : ''}>Montserrat (Bold Clean)</option>
            <option value="'Nunito', sans-serif" ${currentStyles.fontFamily?.includes('Nunito') ? 'selected' : ''}>Nunito (Soft Rounded)</option>
            <option value="'Outfit', sans-serif" ${currentStyles.fontFamily?.includes('Outfit') ? 'selected' : ''}>Outfit (Modern Tech)</option>
            <option value="'Oswald', sans-serif" ${currentStyles.fontFamily?.includes('Oswald') ? 'selected' : ''}>Oswald (Tall & Strong)</option>
            <option value="'Lora', serif" ${currentStyles.fontFamily?.includes('Lora') ? 'selected' : ''}>Lora (Elegant Serif)</option>
            <option value="'Playfair Display', serif" ${currentStyles.fontFamily?.includes('Playfair') ? 'selected' : ''}>Playfair (Luxury Serif)</option>
            <option value="'Times New Roman', serif" ${currentStyles.fontFamily?.includes('Times') ? 'selected' : ''}>Times New Roman (Classic)</option>
            <option value="'Dancing Script', cursive" ${currentStyles.fontFamily?.includes('Dancing') ? 'selected' : ''}>Dancing Script (Cursive)</option>
            <option value="'Space Mono', monospace" ${currentStyles.fontFamily?.includes('Space') ? 'selected' : ''}>Space Mono (Tech/Receipt)</option>
            <option value="'Fira Code', monospace" ${currentStyles.fontFamily?.includes('Fira') ? 'selected' : ''}>Fira Code (Developer)</option>
            <option value="monospace" ${currentStyles.fontFamily === 'monospace' ? 'selected' : ''}>Default Monospace</option>
          </select>
        </div>
        

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Posisi Header</label>
            <select id="style_headerAlign" class="w-full h-10 text-xs border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 dark:text-slate-200 rounded-xl px-3 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 trasition-all">
              <option value="left" ${currentStyles.headerAlign === 'left' ? 'selected' : ''}>Kiri</option>
              <option value="center" ${currentStyles.headerAlign === 'center' || !currentStyles.headerAlign ? 'selected' : ''}>Tengah</option>
              <option value="right" ${currentStyles.headerAlign === 'right' ? 'selected' : ''}>Kanan</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Posisi Isi</label>
            <select id="style_bodyAlign" class="w-full h-10 text-xs border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 dark:text-slate-200 rounded-xl px-3 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 trasition-all">
              <option value="left" ${currentStyles.bodyAlign === 'left' ? 'selected' : ''}>Kiri</option>
              <option value="center" ${currentStyles.bodyAlign === 'center' || !currentStyles.bodyAlign ? 'selected' : ''}>Tengah</option>
              <option value="right" ${currentStyles.bodyAlign === 'right' ? 'selected' : ''}>Kanan</option>
            </select>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
           <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Margin Invoice (mm)</label>
           <div class="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Atas</label>
                <input type="number" id="style_marginTop" value="${currentStyles.marginTop || '10'}" class="w-full h-8 text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-2 outline-none focus:border-indigo-400" min="0" max="50">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Bawah</label>
                <input type="number" id="style_marginBottom" value="${currentStyles.marginBottom || '10'}" class="w-full h-8 text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-2 outline-none focus:border-indigo-400" min="0" max="50">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Kiri</label>
                <input type="number" id="style_marginLeft" value="${currentStyles.marginLeft || '12'}" class="w-full h-8 text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-2 outline-none focus:border-indigo-400" min="0" max="50">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Kanan</label>
                <input type="number" id="style_marginRight" value="${currentStyles.marginRight || '12'}" class="w-full h-8 text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-2 outline-none focus:border-indigo-400" min="0" max="50">
              </div>
           </div>
        </div>

        </div>

        <div class="mt-6 border-t border-slate-200/60 dark:border-slate-700/60 pt-4">
          <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Pengaturan Per Kolom</label>
          <div class="space-y-3">
            ${currentHeaders.map((header, idx) => {
              const align = currentColumnAligns[idx] || { header: 'center', body: 'center' };
              return `
              <div class="bg-slate-50 dark:bg-slate-700/30 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 column-align-row" data-column-index="${idx}">
                <div class="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mb-2 truncate" title="${header}">${header}</div>
                <div class="grid grid-cols-2 gap-2">
                  <select class="th-align text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 h-7 outline-none">
                    <option value="left" ${align.header === 'left' ? 'selected' : ''}>Header L</option>
                    <option value="center" ${align.header === 'center' ? 'selected' : ''}>Header C</option>
                    <option value="right" ${align.header === 'right' ? 'selected' : ''}>Header R</option>
                  </select>
                  <select class="td-align text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 h-7 outline-none">
                    <option value="left" ${align.body === 'left' ? 'selected' : ''}>Isi L</option>
                    <option value="center" ${align.body === 'center' ? 'selected' : ''}>Isi C</option>
                    <option value="right" ${align.body === 'right' ? 'selected' : ''}>Isi R</option>
                  </select>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </div>

        <button id="btn_applyStyle" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 text-white text-xs font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 dark:hover:from-indigo-600 dark:hover:to-violet-600 transition-all mt-6 uppercase tracking-widest shadow-md shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5 hover:shadow-lg">
          Update Desain
        </button>
      </div>
    </div>
  `;

  // Event Listener
  document.getElementById('btn_applyStyle').addEventListener('click', () => {
    const styles = {
      template: document.getElementById('style_template').value,
      headerBg: document.getElementById('style_headerBg').value,
      borderColor: document.getElementById('style_borderColor').value,
      headerFontColor: document.getElementById('style_headerFontColor').value,
      cellFontColor: document.getElementById('style_cellFontColor').value,
      fontFamily: document.getElementById('style_fontFamily').value,
      headerAlign: document.getElementById('style_headerAlign').value,
      bodyAlign: document.getElementById('style_bodyAlign').value,
      marginTop: document.getElementById('style_marginTop').value,
      marginBottom: document.getElementById('style_marginBottom').value,
      marginLeft: document.getElementById('style_marginLeft').value,
      marginRight: document.getElementById('style_marginRight').value,
      columnAligns: Array.from(document.querySelectorAll('.column-align-row')).map(row => ({
        header: row.querySelector('.th-align').value,
        body: row.querySelector('.td-align').value
      }))
    };
    
    // Apply and Save
    if (targetTableId) {
      applyStyleToTable(targetTableId, styles, globalState);
    } else {
      // If no ID (like general settings), apply to all or first
      globalState.tables.forEach(t => applyStyleToTable(t.tableId, styles, globalState));
    }
    
    // Re-render invoice if on invoice page
    if (window.location.pathname.includes('invoice.html')) {
        // Trigger a re-render by looking for the global function (this is a bit hacky but works for this structure)
        if (typeof window.triggerInvoiceRender === 'function') {
            window.triggerInvoiceRender();
        }
    }

    // Sync to storage
    const storageKey = 'invoxcel_tables';
    const savedTables = localStorage.getItem(storageKey) || localStorage.getItem('excelTableManager_tables');
    if (savedTables) {
      try {
        const allTables = JSON.parse(savedTables);
        globalState.tables.forEach(modifiedTable => {
          const idx = allTables.findIndex(t => t.tableId === modifiedTable.tableId);
          if (idx !== -1) {
            allTables[idx].styles = modifiedTable.styles;
          }
        });
        localStorage.setItem(storageKey, JSON.stringify(allTables));
        localStorage.setItem('invoxcel_timestamp', Date.now().toString());
      } catch (e) {
        console.error('Gagal sinkronisasi styles', e);
        localStorage.setItem(storageKey, JSON.stringify(globalState.tables));
        localStorage.setItem('invoxcel_timestamp', Date.now().toString());
      }
    } else {
      localStorage.setItem(storageKey, JSON.stringify(globalState.tables));
      localStorage.setItem('invoxcel_timestamp', Date.now().toString());
    }
  });

  // Apply saved styles on init to DOM if elements exist
  globalState.tables.forEach(table => {
    if (table.styles) {
      applyStyleToTableDOM(table.tableId, table.styles);
    }
  });
}

export function applyStyleToTable(tableId, styles, globalState) {
  const tableData = globalState.tables.find(t => t.tableId === tableId);
  if (tableData) {
    tableData.styles = { ...styles };
  }
  applyStyleToTableDOM(tableId, styles);
}

export function applyStyleToTableDOM(tableId, styles) {
  const tableEl = document.getElementById(tableId);
  if (!tableEl) return;

  // Terapkan ke Header
  const ths = tableEl.querySelectorAll('th');
  ths.forEach((th, idx) => {
    th.style.backgroundColor = styles.headerBg;
    th.style.borderColor = styles.borderColor;
    th.style.color = styles.headerFontColor;
    th.style.fontFamily = styles.fontFamily;
    th.style.fontSize = styles.fontSize;
    th.style.padding = styles.padding;
    const colAlign = styles.columnAligns && styles.columnAligns[idx];
    th.style.textAlign = (colAlign && colAlign.header) || styles.headerAlign || 'center';
  });

  // Terapkan ke Sel
  const tds = tableEl.querySelectorAll('td');
  const headersCount = ths.length;
  tds.forEach((td, idx) => {
    td.style.borderColor = styles.borderColor;
    td.style.color = styles.cellFontColor;
    td.style.fontFamily = styles.fontFamily;
    td.style.fontSize = styles.fontSize;
    td.style.padding = styles.padding;
    const colIdx = idx % headersCount;
    const colAlign = styles.columnAligns && styles.columnAligns[colIdx];
    td.style.textAlign = (colAlign && colAlign.body) || styles.bodyAlign || 'center';
  });

  // Terapkan ke Tabel itu sendiri
  tableEl.style.borderColor = styles.borderColor;
}

function applyStylesToAll(styles, globalState) {
  globalState.tables.forEach(table => {
    applyStyleToTable(table.tableId, styles, globalState);
  });
}
