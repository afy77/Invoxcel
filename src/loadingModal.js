/**
 * loadingModal.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Komponen Loading Modal (Overlay Spinner) yang reusable dan profesional.
 *
 * KONTEKS PESAN yang tersedia:
 *   'import'   → "Sedang mengimpor data... Harap jangan menutup halaman ini."
 *   'save'     → "Menyimpan perubahan..."
 *   'invoice'  → "Membuat invoice... Mohon tunggu sebentar."
 *
 * CARA PENGGUNAAN:
 *   import { showLoadingModal, hideLoadingModal } from './loadingModal.js';
 *
 *   // Tampilkan loading
 *   showLoadingModal('import');
 *
 *   // Sembunyikan loading
 *   hideLoadingModal();
 *
 * CONTOH DENGAN ASYNC/AWAIT + ERROR HANDLING:
 *   showLoadingModal('invoice');
 *   try {
 *     await generateInvoice(data);
 *   } catch (err) {
 *     showToast('Gagal membuat invoice.', 'error');
 *   } finally {
 *     hideLoadingModal();
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Konfigurasi Pesan Kontekstual ──────────────────────────────────────────

/** @type {Record<string, { title: string; subtitle: string; icon: string }>} */
const LOADING_CONTEXTS = {
  /** Saat membaca & memproses file Excel yang diupload */
  import: {
    title: 'Sedang mengimpor data...',
    subtitle: 'Harap jangan menutup halaman ini.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lm-ctx-icon">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
            <path d="M12 12v9"/><path d="m8 17 4 4 4-4"/>
          </svg>`,
  },

  /** Saat menyimpan perubahan data tabel (PUT/PATCH) */
  save: {
    title: 'Menyimpan perubahan...',
    subtitle: 'Data Anda sedang diperbarui.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lm-ctx-icon">
            <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
            <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/>
            <path d="M7 3v4a1 1 0 0 0 1 1h7"/>
          </svg>`,
  },

  /** Saat proses kalkulasi data & pembuatan PDF/Invoice */
  invoice: {
    title: 'Membuat invoice...',
    subtitle: 'Mohon tunggu sebentar.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lm-ctx-icon">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>`,
  },
};

// ─── Konstanta ───────────────────────────────────────────────────────────────

/**
 * Durasi minimum (ms) modal ditampilkan sebelum bisa ditutup.
 * Mencegah modal berkedip terlalu cepat pada proses yang sangat singkat.
 * Nilai: 1500ms (1.5 detik) — terasa natural, tidak terlalu lama.
 */
const MIN_DISPLAY_MS = 1500;

// ─── State Internal ──────────────────────────────────────────────────────────

/** @type {{ isVisible: boolean; overlayEl: HTMLElement | null; shownAt: number }} */
const _state = {
  isVisible: false,
  overlayEl: null,
  shownAt: 0,  // timestamp (ms) saat modal ditampilkan
};

// ─── DOM Builder ─────────────────────────────────────────────────────────────

/**
 * Membangun dan menginject elemen modal ke dalam <body> jika belum ada.
 * @returns {HTMLElement} Elemen overlay
 */
function _buildModal() {
  // Singleton: kembalikan yang sudah ada
  if (_state.overlayEl && document.body.contains(_state.overlayEl)) {
    return _state.overlayEl;
  }

  const overlay = document.createElement('div');
  overlay.id = 'loading-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'lm-title');
  overlay.setAttribute('aria-live', 'assertive');
  overlay.setAttribute('aria-busy', 'true');

  overlay.innerHTML = `
    <div class="lm-backdrop" id="lm-backdrop"></div>
    <div class="lm-card" id="lm-card">

      <!-- Ring Spinner -->
      <div class="lm-spinner-wrap" aria-hidden="true">
        <div class="lm-ring"></div>
        <div class="lm-ring lm-ring--delay1"></div>
        <div class="lm-ring lm-ring--delay2"></div>

        <!-- Context Icon (centre pulse) -->
        <div class="lm-icon-wrap" id="lm-icon-wrap">
          <!-- icon injected by JS -->
        </div>
      </div>

      <!-- Text -->
      <div class="lm-text-block">
        <p class="lm-title" id="lm-title">Memuat...</p>
        <p class="lm-subtitle" id="lm-subtitle"></p>
      </div>

      <!-- Animated Dots Progress -->
      <div class="lm-dots" aria-hidden="true">
        <span class="lm-dot"></span>
        <span class="lm-dot lm-dot--d1"></span>
        <span class="lm-dot lm-dot--d2"></span>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  _state.overlayEl = overlay;
  return overlay;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Mencegah scroll pada body saat modal terbuka */
function _lockScroll() {
  document.body.style.overflow = 'hidden';
}

/** Mengembalikan scroll body setelah modal tertutup */
function _unlockScroll() {
  document.body.style.overflow = '';
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Menampilkan loading modal dengan konteks pesan tertentu.
 *
 * @param {'import' | 'save' | 'invoice'} context - Konteks aksi yang sedang berjalan.
 *
 * @example
 * // Saat user meng-upload file Excel
 * showLoadingModal('import');
 *
 * @example
 * // Saat menyimpan data tabel
 * showLoadingModal('save');
 *
 * @example
 * // Saat generate invoice / PDF
 * showLoadingModal('invoice');
 */
export function showLoadingModal(context = 'import') {
  if (_state.isVisible) return; // Guard: jangan render ulang jika sudah tampil

  const ctx = LOADING_CONTEXTS[context] ?? LOADING_CONTEXTS['import'];
  const overlay = _buildModal();

  // Update konten berdasarkan konteks
  overlay.querySelector('#lm-title').textContent = ctx.title;
  overlay.querySelector('#lm-subtitle').textContent = ctx.subtitle;
  overlay.querySelector('#lm-icon-wrap').innerHTML = ctx.icon;

  // Tampilkan dengan transisi
  // Gunakan requestAnimationFrame agar browser sempat paint sebelum animasi
  overlay.style.display = 'flex';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('lm--visible');
    });
  });

  _lockScroll();
  _state.isVisible = true;
  _state.shownAt = Date.now(); // catat waktu tampil
}

/**
 * Menyembunyikan loading modal dengan animasi fade-out.
 *
 * Selalu panggil di blok `finally` agar modal tertutup bahkan saat terjadi error.
 *
 * @example
 * showLoadingModal('invoice');
 * try {
 *   await someAsyncOperation();
 * } catch (err) {
 *   showToast('Operasi gagal: ' + err.message, 'error');
 * } finally {
 *   hideLoadingModal(); // ← dijamin selalu berjalan
 * }
 */
export function hideLoadingModal() {
  if (!_state.isVisible || !_state.overlayEl) return;

  // Hitung berapa lama modal sudah ditampilkan
  const elapsed = Date.now() - _state.shownAt;
  const remaining = MIN_DISPLAY_MS - elapsed;

  if (remaining > 0) {
    // Proses selesai terlalu cepat → tunda penutupan
    setTimeout(() => _doHide(), remaining);
  } else {
    // Sudah cukup lama → tutup langsung
    _doHide();
  }
}

/** @private — Eksekusi animasi penutupan modal */
function _doHide() {
  const overlay = _state.overlayEl;
  if (!overlay) return;

  overlay.classList.remove('lm--visible');

  // Tunggu transisi CSS selesai baru sembunyikan dari DOM
  overlay.addEventListener(
    'transitionend',
    () => {
      overlay.style.display = 'none';
    },
    { once: true }
  );

  _unlockScroll();
  _state.isVisible = false;
}

// ─── Convenience Wrappers ────────────────────────────────────────────────────

/**
 * Wrapper `withLoading` untuk membungkus operasi async secara otomatis.
 * Sangat disarankan untuk digunakan agar tidak lupa menutup modal.
 *
 * @template T
 * @param {'import' | 'save' | 'invoice'} context - Konteks loading.
 * @param {() => Promise<T>} asyncFn - Fungsi async yang akan dieksekusi.
 * @param {(err: Error) => void} [onError] - Callback opsional saat error.
 * @returns {Promise<T | undefined>}
 *
 * @example
 * // Contoh 1 – Import File (FileReader)
 * fileInput.addEventListener('change', async (e) => {
 *   const file = e.target.files[0];
 *   await withLoading('import', async () => {
 *     const data = await parseExcelFile(file);
 *     renderTables(data);
 *   }, (err) => showToast('Gagal mengimpor: ' + err.message, 'error'));
 * });
 *
 * @example
 * // Contoh 2 – Simpan Data (API POST/PUT)
 * btnSave.addEventListener('click', async () => {
 *   await withLoading('save', async () => {
 *     const response = await fetch('/api/tables', {
 *       method: 'PUT',
 *       body: JSON.stringify(tableData),
 *       headers: { 'Content-Type': 'application/json' },
 *     });
 *     if (!response.ok) throw new Error('Respons server tidak OK');
 *     showToast('Data berhasil disimpan!');
 *   }, (err) => showToast('Gagal menyimpan: ' + err.message, 'error'));
 * });
 *
 * @example
 * // Contoh 3 – Generate Invoice / PDF
 * btnCreateInvoice.addEventListener('click', async () => {
 *   await withLoading('invoice', async () => {
 *     await exportToPdf(tableId, sheetName, meta);
 *     showToast('Invoice berhasil dibuat!');
 *   }, (err) => showToast('Gagal membuat invoice: ' + err.message, 'error'));
 * });
 */
export async function withLoading(context, asyncFn, onError) {
  showLoadingModal(context);
  try {
    return await asyncFn();
  } catch (err) {
    console.error(`[LoadingModal] Error during "${context}" context:`, err);
    if (typeof onError === 'function') {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  } finally {
    hideLoadingModal();
  }
}
