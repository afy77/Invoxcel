/**
 * invoiceRenderer.js
 * Bertanggung jawab merender layout invoice.
 */

export function renderInvoice(tableData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Ekstrak metadata & styles jika ada
  const meta = tableData.invoiceMeta || {};
  const s = tableData.styles || {};

  // Logika Default berdasarkan nama sheet (Sayur/Buah/Protein/Karbo/Bumbu dll)
  let defaultLogoSrc = '';
  let defCompanyName = 'PT. Perusahaan Anda';
  let defCompanyAddress = '';
  let defAccountInfo = '';
  let defSignatureName = '';

  const sheetNameLower = (tableData.sheetName || '').toLowerCase();
  
  if (sheetNameLower.includes('sayur') || sheetNameLower.includes('buah')) {
    defaultLogoSrc = '/METAAGRA.jpeg';
    defCompanyName = 'CV META AGRA';
    defCompanyAddress = '0269-JL PERINTIS KEMERDEKAAN';
    defAccountInfo = '1420195889 / META AGRA CV (IDR)';
    defSignatureName = 'DEDEN NURMANSYAH ZEIN';
  } else if (sheetNameLower.includes('protein')) {
    defaultLogoSrc = '/KALINGGA.jpeg';
    defCompanyName = 'CV KALINGGA MURDA';
    defCompanyAddress = '0269-JL PERINTIS KEMERDEKAAN';
    defAccountInfo = '1420129076 / KALINGGA MURDA CV (IDR)';
    defSignatureName = 'HUSNI TSANI FAIZAL';
  } else if (sheetNameLower.includes('karbo')) {
    defaultLogoSrc = '/SEMESTA.jpeg';
    defCompanyName = 'CV SEMESTA DIRAYA';
    defCompanyAddress = '0269-JL PERINTIS KEMERDEKAAN';
    defAccountInfo = '1420163288 / SEMESTA DIRAYA (IDR)';
    defSignatureName = 'YUSUP KURNIAWAN';
  } else if (sheetNameLower.includes('bumbu') || sheetNameLower.includes('keringan')) {
    defaultLogoSrc = '/BEGJA.jpeg';
    defCompanyName = 'CV BEGJA KEMAYANGAN';
    defCompanyAddress = '0269-JL PERINTIS KEMERDEKAAN';
    defAccountInfo = 'ACOUNT: 1420228726 / BEGJA KEMAYANGAN CV (IDR)';
    defSignatureName = 'RENDRA WIJAYA';
  }

  // Logo Size Defaults
  let defLogoWidth = '400';
  if (tableData.tableId === 'table_4') {
    defLogoWidth = '600';
  } else if (tableData.tableId === 'table_5') {
    defLogoWidth = '450';
  } else if (sheetNameLower.includes('protein')) {
    defLogoWidth = '600';
  }
  
  const displayLogoUrl = meta.logoBase64 || defaultLogoSrc;

  // Default Styles with Overrides
  const headerBg = s.headerBg || '#706f6fff';
  const borderColor = s.borderColor || '#757575ff';
  const headerFontColor = s.headerFontColor || '#ffffff';
  const cellFontColor = s.cellFontColor || '#000000';
  const fontFamily = s.fontFamily || 'Inter, sans-serif';
  const headerAlign = s.headerAlign || 'center';
  const bodyAlign = s.bodyAlign || 'center';
  const columnAligns = s.columnAligns || []; // Array of alignments for each column
  const accentColor = '#4f46e5';
  
  // SOLUSI UNTUK DATA BANYAK: Ukuran font & padding dinamis agar TETAP 1 LEMBAR
  const rowCount = tableData.rows.length;
  let fontSize = '12px';
  let padding = '6px 10px';
  let sectionGap = 'gap-6'; // Gap antar bagian bawah
  let sectionMb = 'mb-6';
  let containerPadding = 'p-4';
  
  if (rowCount > 12 && rowCount <= 18) {
    fontSize = '10px';
    padding = '4px 8px';
    sectionMb = 'mb-4';
    containerPadding = 'p-6';
  } else if (rowCount > 18 && rowCount <= 22) {
    fontSize = '9px';
    padding = '2px 6px';
    sectionMb = 'mb-3';
    containerPadding = 'px-6 py-4';
  } else if (rowCount > 22 && rowCount <= 26) {
    fontSize = '8px';
    padding = '1px 5px';
    sectionGap = 'gap-4';
    sectionMb = 'mb-2';
    containerPadding = 'px-4 py-3';
  } else if (rowCount > 26) {
    fontSize = '7.5px';
    padding = '1px 3px';
    sectionGap = 'gap-2';
    sectionMb = 'mb-1';
    containerPadding = 'px-3 py-2';
  }

  // Hitung otomatis subtotal dari kolom "Jumlah" (index 3)
  const calculatedSubtotal = tableData.rows.reduce((sum, row) => {
    const val = row[3];
    if (val === undefined || val === null || val === '') return sum;
    const cleaned = val.toString().replace(/[^0-9]/g, '');
    const number = parseInt(cleaned, 10);
    return isNaN(number) ? sum : sum + number;
  }, 0);

  // Helper formatting rupiah untuk tampilan awal
  const toRupiahStatic = (num) => {
    return num.toLocaleString('id-ID');
  };

  const templateName = s.template || 'default-noline';
  const isNoLineTemplate = templateName === 'default-noline';

  // Pastikan kolom PPN ada di headers dan rows
  let finalHeaders = [...tableData.headers];
  let ppnIdx = finalHeaders.findIndex(h => h.toUpperCase().includes('PPN'));
  
  if (ppnIdx === -1) {
    // Sesuai permintaan: Nama, Jumlah, Harga, Subtotal, PPN (ujung kanan)
    finalHeaders.push('PPN');
    ppnIdx = finalHeaders.length - 1;
    
    // Tambahkan data kosong di setiap baris untuk kolom PPN di paling akhir
    tableData.rows = tableData.rows.map(row => {
      const newRow = [...row];
      newRow.push('');
      return newRow;
    });
  } else if (ppnIdx !== finalHeaders.length - 1) {
    // Jika PPN sudah ada tapi tidak di ujung, pindahkan ke ujung
    const ppnHeader = finalHeaders.splice(ppnIdx, 1)[0];
    finalHeaders.push(ppnHeader);
    
    tableData.rows = tableData.rows.map(row => {
      const newRow = [...row];
      const ppnVal = newRow.splice(ppnIdx, 1)[0];
      newRow.push(ppnVal);
      return newRow;
    });
  }

  container.innerHTML = `
    <div class="max-w-4xl print:max-w-none w-full mx-auto ${containerPadding} bg-white invoice-template-${templateName}" style="font-family: ${fontFamily}; color: ${cellFontColor};">
      <!-- HEADER AREA (Logo) -->
      <div class="flex flex-col items-center justify-center border-b-4 border-double border-gray-800 pt-8 pb-3 ${sectionMb} relative">
        <div class="w-full flex justify-center relative group">
          <div class="print:hidden absolute top-0 right-0 z-10 flex gap-2">
            <div id="imageControls" class="hidden items-center gap-3 bg-white px-3 py-1.5 rounded-lg shadow-md border border-gray-200">
              <div class="flex gap-1 border-r border-gray-200 pr-2">
                <button type="button" class="btn-logo-size px-2 py-1 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 rounded transition-colors" data-size="150">S</button>
                <button type="button" class="btn-logo-size px-2 py-1 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 rounded transition-colors" data-size="250">M</button>
                <button type="button" class="btn-logo-size px-2 py-1 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 rounded transition-colors" data-size="400">L</button>
              </div>
              <div class="flex gap-1 border-r border-gray-200 pr-2">
                <button type="button" class="btn-logo-align px-2 py-1 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 rounded transition-colors" data-align="start" title="Align Left">L</button>
                <button type="button" class="btn-logo-align px-2 py-1 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 rounded transition-colors" data-align="center" title="Align Center">C</button>
                <button type="button" class="btn-logo-align px-2 py-1 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 rounded transition-colors" data-align="end" title="Align Right">R</button>
              </div>
              <div class="flex items-center gap-1">
                <input type="number" id="logoWidthInput" class="w-14 px-1 py-1 text-xs border border-gray-200 rounded outline-none focus:border-indigo-400" min="50" max="1000" value="250">
                <span class="text-[10px] font-bold text-gray-400 uppercase">px</span>
              </div>
            </div>
            <label for="logoUpload" class="cursor-pointer p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors shadow-sm" title="Upload Gambar Header">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </label>
            <input type="file" id="logoUpload" accept="image/*" class="hidden">
          </div>
          
          <div id="logoContainer" class="${displayLogoUrl ? '' : 'border-2 border-dashed border-gray-200'} min-h-[60px] w-full flex items-center border-none rounded group-hover:border-indigo-300 transition-colors">
            <span id="logoPlaceholder" class="text-gray-400 print:hidden text-xs ${displayLogoUrl ? 'hidden' : ''}">Klik icon upload untuk header</span>
            <img id="companyLogo" src="${displayLogoUrl}" class="${displayLogoUrl ? '' : 'hidden'} max-w-full object-contain" style="width: ${defLogoWidth}px;" alt="Header Image">
          </div>
        </div>
      </div>

      <!-- INFO SECTION -->
      <div class="flex flex-row justify-between ${sectionMb} gap-4 text-xs font-medium uppercase tracking-wider">
        <div class="w-1/2">
          <h3 class="text-[10px] font-bold text-black mb-1">PELANGGAN</h3>
          <div class="flex flex-col gap-y-1">
            <textarea id="inv_customerName" class="invoice-field text-sm font-bold text-gray-900 border-none outline-none w-full bg-transparent resize-none overflow-hidden placeholder-gray-400 leading-tight py-0" rows="1" placeholder="Nama Pelanggan">${meta.customerName || ''}</textarea>
            <textarea id="inv_customerAddress" class="invoice-field text-black border-none outline-none w-full bg-transparent resize-none overflow-hidden placeholder-gray-400 text-xs leading-tight py-0" rows="1" placeholder="Alamat & Kontak">${meta.customerAddress || ''}</textarea>
          </div>
        </div> 
        <div class="w-1/3">
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 mt-5">
            <div class="text-black font-bold">Tanggal:</div>
            <div><input type="date" id="inv_date" class="invoice-field border-none outline-none bg-transparent text-gray-900 font-bold w-full p-0 text-xs" value="${meta.date || today}"></div>
            <div class="text-black font-bold">Jatuh Tempo:</div>
            <div><input type="date" id="inv_dueDate" class="invoice-field border-none outline-none bg-transparent text-gray-900 font-bold w-full p-0 text-xs" value="${meta.dueDate || nextWeek}"></div>
          </div>
        </div>
      </div>

      <!-- TABLE SECTION -->
      <div class="${sectionMb}">
        <table class="w-full text-left border-collapse" id="invoiceTable" style="border-color: ${borderColor}; font-size: ${fontSize};">
          <thead>
            <tr>
              ${finalHeaders.map((h, idx) => {
                const align = (columnAligns[idx] && columnAligns[idx].header) || headerAlign;
                let widthStyle = '';
                const title = typeof h === 'string' ? h.toUpperCase() : '';
                
                if (title.includes('NAMA') || idx === 0) {
                  widthStyle = 'width: 32%;';
                } else if (title.includes('JUMLAH') || idx === 1) {
                  widthStyle = 'width: 9%;';
                } else if (title.includes('HARGA') || idx === 2) {
                  widthStyle = 'width: 15%;';
                } else if (title.includes('SUB') || title.includes('TOTAL') || idx === 3) {
                  widthStyle = 'width: 19%;';
                } else if (title.includes('PPN')) {
                  widthStyle = 'width: 25%;';
                }
                
                // Memaksa HARGA SATUAN menjadi 2 baris
                let displayH = h;
                if (title === 'HARGA SATUAN') {
                  displayH = 'HARGA<br/>SATUAN';
                }
                
                return `<th style="background-color: ${headerBg}; border-color: ${borderColor}; color: ${headerFontColor}; padding: ${padding}; border-width: 1px; border-style: solid; -webkit-print-color-adjust: exact; print-color-adjust: exact; text-align: ${align}; ${widthStyle}" class="font-extrabold uppercase tracking-wide leading-tight">${displayH}</th>`;
              }).join('')}
            </tr>
          </thead>
          <tbody id="invoiceTableBody">
            ${tableData.rows.map((row) => `
              <tr>
                ${finalHeaders.map((_h, idx) => {
                  let cell = row[idx];
                  let displayVal = (cell !== undefined && cell !== null) ? cell : '';

                  const upperH = typeof _h === 'string' ? _h.toUpperCase() : '';
                  if (upperH === 'NAMA BARANG' && displayVal !== '') {
                    displayVal = displayVal.toString().toUpperCase();
                  }

                  // Quantity/JUMLAH: thousands separator for index 1
                  if (idx === 1 && displayVal !== '') {
                    const cleaned = displayVal.toString().replace(/[^0-9]/g, '');
                    const number = parseInt(cleaned, 10);
                    if (!isNaN(number)) {
                      displayVal = number.toLocaleString('id-ID');
                    }
                  }

                  // Format Rupiah for columns (Harga, Subtotal, PPN)
                  const isCurrencyCol = idx >= 2 || upperH.includes('PPN');
                  if (isCurrencyCol && displayVal !== '' && !displayVal.toString().includes('Rp')) {
                    const cleaned = displayVal.toString().replace(/[^0-9]/g, '');
                    const number = parseInt(cleaned, 10);
                    if (!isNaN(number)) {
                      if (upperH.includes('PPN') && number === 0) {
                        displayVal = '';
                      } else {
                        displayVal = 'Rp ' + number.toLocaleString('id-ID');
                      }
                    }
                  }
                  // Gunakan &nbsp; jika kosong agar border tetap tampil sempurna di semua browser
                   let align = (columnAligns[idx] && columnAligns[idx].body) || bodyAlign;
                   if (upperH === 'NAMA BARANG') {
                     align = 'left';
                   }
                  return `<td style="border-color: ${borderColor}; padding: ${padding}; border-width: 1px; border-style: solid; text-align: ${align};">${displayVal || '&nbsp;'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
          <tfoot style="border-top: 1px solid ${borderColor};"><tr><td colspan="${finalHeaders.length}"></td></tr></tfoot>
        </table>
      </div>

      <!-- BOTTOM SECTION: Totals, Info, & Signature -->
      <div class="flex flex-col ${sectionGap}">
        <!-- TOTALS (Aligned Right, but small width) -->
        <!-- TOTALS (Vertical Layout) -->
        <div class="flex justify-end pr-2 md:pr-4">
          <div class="w-72 md:w-80 space-y-1">
            <div class="flex justify-between items-center py-1 border-b border-gray-100  px-2">
              <span class="text-black text-[10px] uppercase font-bold">SUB TOTAL</span>
              <div class="flex items-center font-bold text-gray-800 text-xs">
                <span class="mr-1">Rp</span>
                <input type="text" id="inv_subtotal" class="invoice-field total-input border-none outline-none bg-transparent text-right w-40 font-bold pr-2 py-1 not-italic" placeholder="0" value="${meta.subtotal || toRupiahStatic(calculatedSubtotal)}">
              </div>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-gray-100  px-2">
              <span class="text-black text-[10px] uppercase font-bold">PPN</span>
              <div class="flex items-center font-bold text-gray-800 text-xs">
                <span class="mr-1 ppn-prefix ${(!meta.ppn || meta.ppn === '0') ? 'hidden' : ''}">Rp</span>
                <input type="text" id="inv_ppn" class="invoice-field total-input border-none outline-none bg-transparent text-right w-40 font-bold pr-2 py-1 not-italic" placeholder=" " value="${(meta.ppn && meta.ppn !== '0') ? meta.ppn : ''}">
              </div>
            </div>
            <div class="flex justify-between items-center py-2 bg-gray-50 px-2 rounded mt-2 shadow-sm" style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">
              <span class="text-base font-bold text-gray-800 uppercase tracking-tight">TOTAL</span>
              <div class="flex items-center font-black text-black text-base">
                <span class="mr-1">Rp</span>
                <input type="text" id="inv_total" class="invoice-field total-input border-none outline-none bg-transparent text-right w-40 font-black pr-2 py-1 not-italic" placeholder="0" value="${meta.total || toRupiahStatic(calculatedSubtotal)}">
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER: Info (Left) & Signature (Right) -->
        <div class="flex justify-between items-start gap-12 mt-4">
          <!-- LEFT: Company & Account Info -->
          <div class="flex-1 space-y-4">
            <div>
              <textarea id="inv_companyName" class="invoice-field text-xs font-bold text-gray-900 block border-none outline-none resize-none overflow-hidden bg-transparent w-full mb-1 leading-normal py-0.5" rows="1" placeholder="Nama Perusahaan">${meta.companyName || defCompanyName}</textarea>
              <textarea id="inv_companyAddress" class="invoice-field text-[10px] text-black border-none outline-none w-full bg-transparent resize-none overflow-hidden leading-normal py-0.5" rows="1" placeholder="Alamat & Kontak Perusahaan">${meta.companyAddress || defCompanyAddress}</textarea>
            </div>
            <div>
              <h4 class="text-[10px] font-bold text-black uppercase tracking-widest mb-1">REKENING PEMBAYARAN</h4>
              <textarea id="inv_accountInfo" class="invoice-field text-[10px] text-black font-medium border-none outline-none w-full bg-transparent resize-none overflow-hidden leading-normal py-0.5" rows="1" placeholder="Nama Bank: 000000 / Atas Nama">${meta.accountInfo || defAccountInfo}</textarea>
            </div>
          </div>

          <!-- RIGHT: Signature (Hormat Kami) -->
          <div class="w-48 text-center flex flex-col items-center">
            <p class="text-[11px] font-bold text-gray-900 mb-28 uppercase tracking-wider">HORMAT KAMI</p>
            ${isNoLineTemplate ? '' : '<div class="w-full h-px bg-black mb-2"></div>'}
            <textarea id="inv_signatureName" class="invoice-field text-center font-bold text-xs text-gray-900 border-none outline-none resize-none overflow-hidden bg-transparent w-full leading-normal py-0.5" rows="1" placeholder="Isi Nama">${meta.signatureName || defSignatureName}</textarea>
          </div>
        </div>
      </div>
    </div>
  `;

  // Helper formatting rupiah
  const formatRupiah = (value) => {
    if (!value) return '';
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  // Event Listeners for Totals Formatting
  container.querySelectorAll('.total-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const formatted = formatRupiah(e.target.value);
      e.target.value = formatted;
      
      // Update PPN prefix visibility
      if (e.target.id === 'inv_ppn') {
        const prefix = container.querySelector('.ppn-prefix');
        if (prefix) {
          if (e.target.value && e.target.value !== '0') {
            prefix.classList.remove('hidden');
          } else {
            prefix.classList.add('hidden');
          }
        }
      }
    });
  });

  // Event Listeners for Logo Upload & Size
  const logoUpload = document.getElementById('logoUpload');
  const companyLogo = document.getElementById('companyLogo');
  const logoPlaceholder = document.getElementById('logoPlaceholder');
  const logoContainer = document.getElementById('logoContainer');
  const imageControls = document.getElementById('imageControls');
  const logoWidthInput = document.getElementById('logoWidthInput');
  const presetBtns = document.querySelectorAll('.btn-logo-size');

  // Load saved settings from localStorage
  const defaultWidth = defLogoWidth;
  
  const savedWidth = localStorage.getItem('preferredLogoWidth') || defaultWidth;
  const savedAlign = localStorage.getItem('preferredLogoAlign') || 'center';

  const updateLogoWidth = (width) => {
    if (companyLogo) {
      companyLogo.style.width = `${width}px`;
      if (logoWidthInput) logoWidthInput.value = width;
      localStorage.setItem('preferredLogoWidth', width);
    }
  };

  const updateLogoAlignment = (align) => {
    if (logoContainer) {
      logoContainer.classList.remove('justify-start', 'justify-center', 'justify-end');
      logoContainer.classList.add(`justify-${align}`);
      localStorage.setItem('preferredLogoAlign', align);
    }
  };

  if (companyLogo) {
    companyLogo.style.width = `${savedWidth}px`;
    if (logoWidthInput) logoWidthInput.value = savedWidth;
  }
  if (logoContainer) {
    updateLogoAlignment(savedAlign);
  }

  // Show image controls if logo exists
  if (displayLogoUrl && imageControls) {
    imageControls.classList.remove('hidden');
    imageControls.classList.add('flex');
  }

  if (logoUpload && companyLogo) {
    logoUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Data = event.target.result;
          companyLogo.src = base64Data;
          companyLogo.classList.remove('hidden');
          logoPlaceholder.classList.add('hidden');
          logoContainer.classList.remove('border-2', 'border-dashed', 'border-gray-200');
          imageControls.classList.remove('hidden');
          imageControls.classList.add('flex');
          
          // Save to meta immediately
          saveInvoiceMeta();
        };
        reader.readAsDataURL(file);
      }
    });

    // Preset Buttons
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        updateLogoWidth(btn.dataset.size);
      });
    });

    // Alignment Buttons
    const alignBtns = document.querySelectorAll('.btn-logo-align');
    alignBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        updateLogoAlignment(btn.dataset.align);
      });
    });

    // Manual Input
    logoWidthInput.addEventListener('input', (e) => {
      if (e.target.value) {
        updateLogoWidth(e.target.value);
      }
    });
  }

  // --- PERSISTENCE LOGIC ---
  const saveInvoiceMeta = () => {
    const fields = container.querySelectorAll('.invoice-field');
    const newMeta = { ...meta }; // Keep existing meta like themeId and logo
    fields.forEach(field => {
      const key = field.id.replace('inv_', '');
      newMeta[key] = field.value;
    });

    // Capture the logo if it exists
    const currentLogo = document.getElementById('companyLogo');
    if (currentLogo && !currentLogo.classList.contains('hidden') && currentLogo.src.startsWith('data:')) {
      newMeta.logoBase64 = currentLogo.src;
    }

    // Sync back to localStorage tables
    const storageKey = 'invoxcel_tables';
    const savedTables = localStorage.getItem(storageKey) || localStorage.getItem('excelTableManager_tables');
    if (savedTables) {
      try {
        const tables = JSON.parse(savedTables);
        const currentTableIdx = tables.findIndex(t => t.tableId === tableData.tableId);
        if (currentTableIdx !== -1) {
          tables[currentTableIdx].invoiceMeta = newMeta;
          localStorage.setItem(storageKey, JSON.stringify(tables));
          localStorage.setItem('invoxcel_timestamp', Date.now().toString());
          
          // Also update session storage so it's consistent for this session
          tableData.invoiceMeta = newMeta;
          sessionStorage.setItem('invoiceData', JSON.stringify(tableData));
        }
      } catch (e) {
        console.error('Failed to sync invoice meta', e);
      }
    }
  };

  // Attach auto-save listener to all fields
  container.querySelectorAll('.invoice-field').forEach(field => {
    field.addEventListener('input', saveInvoiceMeta);

    // Auto resize textareas
    if (field.tagName === 'TEXTAREA') {
      const resize = () => {
        field.style.height = 'auto'; // Reset height
        field.style.height = (field.scrollHeight + 3) + 'px'; // Set to actual scroll height with a bigger buffer (3px) to prevent clipping
      };
      field.addEventListener('input', resize);
      // Run immediately with a tiny delay to ensure CSS is applied
      setTimeout(resize, 50);
    }
  });
}
