/**
 * invoiceGenerator.js
 * Entry point untuk halaman invoice.
 * Mengambil data dari sessionStorage dan menginisialisasi renderer.
 */
import './index.css';
import { renderInvoice } from './invoiceRenderer.js';
import { initStyleController } from './styleController.js';
import html2pdf from 'html2pdf.js';

document.addEventListener('DOMContentLoaded', () => {
  // Ambil data dari sessionStorage
  const rawData = sessionStorage.getItem('invoiceData');
  
  if (!rawData) {
    alert('Data tabel tidak ditemukan. Kembali ke halaman utama.');
    window.location.href = '/';
    return;
  }

  try {
    const tableData = JSON.parse(rawData);
    
    // Validasi data minimal
    if (!tableData.headers || !tableData.rows) {
      throw new Error('Format data tidak valid');
    }

    // Fungsi Render Global untuk StyleController
    window.triggerInvoiceRender = () => {
        renderInvoice(tableData, 'invoiceContainer');
    };

    // Render Awal
    window.triggerInvoiceRender();

    // Inisialisasi Style Panel (Target: Tabel ini saja)
    // Kita bungkus tableData dalam globalState-like object agar StyleController mengenalnya
    const mockGlobalState = { tables: [tableData] };
    initStyleController('stylePanelContainer', mockGlobalState, tableData.tableId);

    // Setup event listeners untuk tombol aksi
    document.getElementById('btnBack').addEventListener('click', () => {
      window.location.href = '/';
    });

    document.getElementById('btnPrint').addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btnPdf').addEventListener('click', () => {
      const element = document.getElementById('invoiceContainer');
      if (!element) return;

      const opt = {
        margin:       [0, 0, 0, 0],
        filename:     `Invoice_${generateInvoiceNumber()}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { 
          scale: 3, 
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // Use the promise-based API for better reliability
      html2pdf().set(opt).from(element).save();
    });

  } catch (error) {
    console.error('Error parsing invoice data:', error);
    alert('Terjadi kesalahan saat memuat data invoice.');
  }
});

// Helper untuk generate nomor invoice default
export function generateInvoiceNumber() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  // Random 3 digit number for demo purposes
  const random = Math.floor(Math.random() * 900) + 100;
  return `INV-${yyyy}${mm}${dd}-${random}`;
}
