/**
 * fileHandler.js
 * Bertanggung jawab untuk menangani input file dan drag & drop.
 */

export function initFileHandler(dropZoneId, fileInputId, onFileReady) {
  const dropZone = document.getElementById(dropZoneId);
  const fileInput = document.getElementById(fileInputId);

  if (!dropZone || !fileInput) return;

  // Handle klik untuk membuka file dialog
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  // Handle perubahan input file
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file, onFileReady);
  });

  // Handle Drag & Drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-indigo-500', 'bg-indigo-50');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-indigo-500', 'bg-indigo-50');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-indigo-500', 'bg-indigo-50');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, onFileReady);
  });
}

function handleFile(file, callback) {
  // Validasi ekstensi file
  const validExtensions = ['xlsx', 'xls', 'csv'];
  const fileExtension = file.name.split('.').pop().toLowerCase();

  if (!validExtensions.includes(fileExtension)) {
    alert('Format file tidak didukung. Harap unggah file Excel (.xlsx, .xls) atau CSV.');
    return;
  }

  // Kirim file ke callback (tableParser)
  callback(file);
}
