export function showToast(message, type = 'success', duration = 3000) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none print:hidden';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-slate-800';
  const icon = type === 'success' 
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"/></svg>'
    : type === 'error'
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg shadow-black/10 ${bgColor} text-white font-medium text-sm transform transition-all duration-300 translate-y-10 opacity-0 pointer-events-auto`;
  toast.innerHTML = `
    <div class="shrink-0">${icon}</div>
    <div>${message}</div>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  if (duration !== 0) {
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

export function showConfirm(message, onConfirm) {
  let overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm opacity-0 transition-opacity duration-200';
  
  const modal = document.createElement('div');
  modal.className = 'bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform scale-95 opacity-0 transition-all duration-200 border border-slate-200 dark:border-slate-700';
  
  modal.innerHTML = `
    <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Konfirmasi</h3>
    <p class="text-slate-600 dark:text-slate-300 text-sm mb-6">${message}</p>
    <div class="flex justify-end gap-3">
      <button id="btnCancel" class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Batal</button>
      <button id="btnConfirm" class="px-4 py-2 text-sm font-semibold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors shadow-none hover:shadow-lg hover:-translate-y-0.5 transform">Hapus</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const closeDialog = () => {
    overlay.classList.remove('opacity-100');
    modal.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => overlay.remove(), 250);
  };

  requestAnimationFrame(() => {
    overlay.classList.add('opacity-100');
    modal.classList.add('scale-100', 'opacity-100');
  });

  overlay.querySelector('#btnCancel').addEventListener('click', closeDialog);
  overlay.querySelector('#btnConfirm').addEventListener('click', () => {
    closeDialog();
    if (onConfirm) onConfirm();
  });
}
