/**
 * printManager.js
 * Bertanggung jawab untuk mencetak tabel tertentu.
 */

export function printTable(tableId, meta = {}) {
  const cardEl = document.getElementById(`card_${tableId}`);
  if (!cardEl) return;

  // Buat elemen iframe tersembunyi untuk print
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.top = '-9999px';
  document.body.appendChild(printFrame);

  const printDocument = printFrame.contentWindow.document;
  
  // Ambil HTML dari tabel
  const tableHtml = cardEl.querySelector('.overflow-x-auto').innerHTML;
  const titleHtml = cardEl.querySelector('h3').outerHTML;

  const customerHtml = meta.customerName ? `
    <div style="margin-bottom: 20px; font-size: 14px;">
      <strong>Pelanggan:</strong> ${meta.customerName}<br>
      ${meta.customerAddress ? `<strong>Alamat:</strong> ${meta.customerAddress}<br>` : ''}
      ${meta.date ? `<strong>Tanggal:</strong> ${meta.date}` : ''}
    </div>
  ` : '';

  // Tulis ke iframe
  printDocument.open();
  printDocument.write(`
    <html>
      <head>
        <title>Print Table</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
          .action-col, .add-row-container { display: none !important; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${titleHtml}
        ${customerHtml}
        ${tableHtml}
      </body>
    </html>
  `);
  printDocument.close();

  // Tunggu render selesai lalu print
  setTimeout(() => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
    // Hapus iframe setelah print
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  }, 250);
}
