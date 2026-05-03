/**
 * pdfExporter.js
 * Bertanggung jawab untuk mengekspor tabel ke PDF menggunakan html2pdf.js.
 */
import html2pdf from 'html2pdf.js';

export function exportToPdf(tableId, sheetName, meta = {}) {
  const containerEl = document.getElementById(`container_${tableId}`);
  if (!containerEl) return;

  // Clone elemen agar kita bisa menyembunyikan kolom aksi tanpa mempengaruhi UI asli
  const clone = containerEl.cloneNode(true);
  
  // Hapus elemen yang tidak perlu di PDF
  const actionCols = clone.querySelectorAll('.action-col');
  actionCols.forEach(col => col.remove());
  
  const addRowBtn = clone.querySelector('.add-row-container');
  if (addRowBtn) addRowBtn.remove();

  // Buat wrapper untuk PDF
  const wrapper = document.createElement('div');
  wrapper.style.padding = '20px';
  
  const title = document.createElement('h2');
  title.style.fontFamily = 'sans-serif';
  title.style.marginBottom = '5px';
  const tableNum = tableId.replace('table_', '');
  title.textContent = `Tabel ${tableNum}: ${sheetName}`;
  
  wrapper.appendChild(title);

  if (meta.customerName) {
    const metaDiv = document.createElement('div');
    metaDiv.style.fontFamily = 'sans-serif';
    metaDiv.style.marginBottom = '15px';
    metaDiv.style.fontSize = '12px';
    metaDiv.innerHTML = `
      <strong>Pelanggan:</strong> ${meta.customerName}<br>
      ${meta.customerAddress ? `<strong>Alamat:</strong> ${meta.customerAddress}<br>` : ''}
      ${meta.date ? `<strong>Tanggal:</strong> ${meta.date}` : ''}
    `;
    wrapper.appendChild(metaDiv);
  }

  wrapper.appendChild(clone);

  const opt = {
    margin:       10,
    filename:     `${sheetName}_export.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  // Generate PDF
  html2pdf().set(opt).from(wrapper).save();
}
