/**
 * styleController.js
 * Bertanggung jawab untuk mengelola styling tabel secara dinamis.
 */

export function initStyleController(panelId, globalState, targetTableId = null) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const currentStyles = targetTableId 
    ? (globalState.tables.find(t => t.tableId === targetTableId)?.styles || {})
    : (globalState.tables[0]?.styles || {});

  // Render UI Panel Styling (Compact Sidebar Version)
  panel.innerHTML = `
    <div class="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-indigo-100/30 border border-slate-200 no-print sticky top-8">
      <h3 class="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 uppercase tracking-widest mb-6 border-b border-slate-200/60 pb-3">Desain Tabel</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Template Invoice</label>
          <select id="style_template" class="w-full h-10 text-xs border border-slate-200 bg-slate-50 rounded-xl px-3 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 trasition-all">
            <option value="default" ${currentStyles.template === 'default' || !currentStyles.template ? 'selected' : ''}>Standard (Default)</option>
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
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Warna Header</label>
          <input type="color" id="style_headerBg" value="${currentStyles.headerBg || '#374151'}" class="w-full h-10 rounded-xl cursor-pointer border border-slate-200">
        </div>
        
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Warna Border</label>
          <input type="color" id="style_borderColor" value="${currentStyles.borderColor || '#000000'}" class="w-full h-10 rounded-xl cursor-pointer border border-slate-200">
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Teks Header</label>
          <input type="color" id="style_headerFontColor" value="${currentStyles.headerFontColor || '#ffffff'}" class="w-full h-10 rounded-xl cursor-pointer border border-slate-200">
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Teks Sel</label>
          <input type="color" id="style_cellFontColor" value="${currentStyles.cellFontColor || '#000000'}" class="w-full h-10 rounded-xl cursor-pointer border border-slate-200">
        </div>
        
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Gaya Font</label>
          <select id="style_fontFamily" class="w-full h-10 text-xs border border-slate-200 bg-slate-50 rounded-xl px-3 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 trasition-all">
            <option value="'Inter', sans-serif" ${currentStyles.fontFamily?.includes('Inter') ? 'selected' : ''}>Inter (Minimalist)</option>
            <option value="'Poppins', sans-serif" ${currentStyles.fontFamily?.includes('Poppins') ? 'selected' : ''}>Poppins (Modern Round)</option>
            <option value="'Roboto', sans-serif" ${currentStyles.fontFamily?.includes('Roboto') ? 'selected' : ''}>Roboto (Professional)</option>
            <option value="'Playfair Display', serif" ${currentStyles.fontFamily?.includes('Playfair') ? 'selected' : ''}>Playfair (Luxury Serif)</option>
            <option value="'Times New Roman', serif" ${currentStyles.fontFamily?.includes('Times') ? 'selected' : ''}>Times New Roman (Classic)</option>
            <option value="'Space Mono', monospace" ${currentStyles.fontFamily?.includes('Space') ? 'selected' : ''}>Space Mono (Tech/Receipt)</option>
            <option value="monospace" ${currentStyles.fontFamily === 'monospace' ? 'selected' : ''}>Default Monospace</option>
          </select>
        </div>
        

        <button id="btn_applyStyle" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all mt-6 uppercase tracking-widest shadow-md shadow-indigo-200 hover:-translate-y-0.5 hover:shadow-lg">
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
  ths.forEach(th => {
    th.style.backgroundColor = styles.headerBg;
    th.style.borderColor = styles.borderColor;
    th.style.color = styles.headerFontColor;
    th.style.fontFamily = styles.fontFamily;
    th.style.fontSize = styles.fontSize;
    th.style.padding = styles.padding;
  });

  // Terapkan ke Sel
  const tds = tableEl.querySelectorAll('td');
  tds.forEach(td => {
    td.style.borderColor = styles.borderColor;
    td.style.color = styles.cellFontColor;
    td.style.fontFamily = styles.fontFamily;
    td.style.fontSize = styles.fontSize;
    td.style.padding = styles.padding;
  });

  // Terapkan ke Tabel itu sendiri
  tableEl.style.borderColor = styles.borderColor;
}

function applyStylesToAll(styles, globalState) {
  globalState.tables.forEach(table => {
    applyStyleToTable(table.tableId, styles, globalState);
  });
}
