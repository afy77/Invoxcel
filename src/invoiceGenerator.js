/**
 * invoiceGenerator.js
 * Entry point untuk halaman invoice.
 * Mengambil data dari sessionStorage dan menginisialisasi renderer.
 */
import './index.css';
import { renderInvoice } from './invoiceRenderer.js';
import { exportToPdf } from './pdfExporter.js';
import { initStyleController } from './styleController.js';
import { initDarkMode } from './darkMode.js';
import { showToast } from './toast.js';
import html2pdf from 'html2pdf.js';

// Init Dark Mode on load
initDarkMode();

document.addEventListener('DOMContentLoaded', () => {
  // Ambil data dari sessionStorage
  const rawData = sessionStorage.getItem('invoiceData');
  
  if (!rawData) {
    showToast('Data tabel tidak ditemukan. Kembali ke halaman utama.', 'error');
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
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
      // Sinkronkan nilai input/textarea ke dalam spesifikasi atribut DOM
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        if (input.tagName === 'TEXTAREA') {
          input.textContent = input.value;
        } else {
          input.setAttribute('value', input.value);
        }
      });

      // Beri sedikit jeda agar DOM terupdate
      setTimeout(() => {
        window.print();
      }, 100);
    });

    document.getElementById('btnPdf')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const originalText = btn.innerHTML;
      const element = document.getElementById('invoiceContainer');
      if (!element) return;

      try {
        // Tampilkan status loading dan disable tombol
        btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memproses PDF...`;
        btn.disabled = true;
        btn.classList.add('cursor-not-allowed', 'opacity-80');

        // Sinkronkan nilai input/textarea ke dalam spesifikasi atribut DOM
        // Karena html2canvas membaca struktur DOM awal, bukan state input yang sedang aktif
        const inputs = element.querySelectorAll('input, textarea');
        // Simpan placeholder agar bisa dikembalikan nanti
        window._pdf_placeholders = [];
        inputs.forEach(input => {
          window._pdf_placeholders.push({ el: input, text: input.getAttribute('placeholder') });
          // Hapus placeholder agar html2canvas mengabaikannya jika kosong
          input.removeAttribute('placeholder');

          if (input.tagName === 'TEXTAREA') {
            input.textContent = input.value;
          } else {
            input.setAttribute('value', input.value);
          }
        });

        // Hapus elemen kontrol sementara saat render PDF agar bersih
        const imageControls = document.getElementById('imageControls');
        if (imageControls) imageControls.classList.add('hidden');

        const opt = {
          margin:       [12, 12, 12, 12],
          filename:     `Invoice_${generateInvoiceNumber()}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { 
            scale: 2, // Kurangi dari 3 menjadi 2 agar tidak boros Memori/lag
            useCORS: true,
            scrollY: 0,
            scrollX: 0
          },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Panggil rendering html2pdf
        await html2pdf().set(opt).from(element).save();

      } catch (err) {
        console.error("Gagal mendownload PDF:", err);
        showToast('Terjadi kendala memproses dokumen PDF. Coba gunakan fitur "Print Invoice".', 'error');
      } finally {
        // Kembalikan placeholder yang dihapus
        if (window._pdf_placeholders) {
          window._pdf_placeholders.forEach(p => {
            if (p.text !== null) p.el.setAttribute('placeholder', p.text);
          });
          delete window._pdf_placeholders;
        }

        // Kembalikan elemen gambar
        const imageControls = document.getElementById('imageControls');
        if (imageControls && !document.getElementById('companyLogo').classList.contains('hidden')) {
          imageControls.classList.remove('hidden');
        }

        // Kembalikan tombol seperti semula
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('cursor-not-allowed', 'opacity-80');
      }
    });

  } catch (error) {
    console.error('Error parsing invoice data:', error);
    showToast('Terjadi kesalahan saat memuat data invoice.', 'error');
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
