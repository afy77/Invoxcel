# Dokumen Akumulasi Pembayaran & Analisis Proyek Invoxcel

Dokumen ini berisi rincian teknis, alur aplikasi, serta kelebihan dan kekurangan aplikasi **Invoxcel (Excel to Invoice)** dengan penyesuaian budget pengembangan.

## 1. Spesifikasi Sistem & Bahasa Pemrograman
Aplikasi ini dibangun menggunakan ekosistem modern untuk efisiensi maksimal:
*   **Bahasa Pemrograman**: TypeScript & JavaScript (Logic), HTML5 (Structure).
*   **Styling Engine**: Tailwind CSS v4 (Desain Premium & Responsive).
*   **Build Tool**: Vite (Kecepatan development & bundling).
*   **Engine Utama**: 
    *   `XLSX` (SheetJS): Pengolahan data Excel.
    *   `html2pdf.js` & `jsPDF`: Generator dokumen PDF.
*   **Infrastruktur**:
    *   **Repository**: GitHub (Version Control).
    *   **Hosting**: Vercel (Deployment otomatis dengan Domain Gratis).

## 2. Analisis Kelebihan & Kekurangan
Berdasarkan arsitektur yang dipilih, berikut adalah ringkasannya:

### Kelebihan (Pros)
1.  **Cost Efficient**: Nol biaya operasional bulanan karena menggunakan hosting Vercel gratis dan repository GitHub.
2.  **Privasi Data Tinggi**: Seluruh pengolahan data terjadi di browser pengguna (Client-Side). Data Excel tidak pernah dikirim ke server mana pun.
3.  **Kecepatan Akses**: Build yang ringan menggunakan Vite memastikan aplikasi terbuka secara instan.
4.  **UI/UX Premium**: Menggunakan Tailwind CSS v4 untuk tampilan yang modern, bersih, dan profesional.
5.  **Smart Parsing**: Logika otomatis memisahkan tabel Excel yang kompleks menjadi invoice yang rapi.

### Kekurangan (Cons)
1.  **Domain Gratis**: Menggunakan akhiran `.vercel.app` (kecuali jika nantinya membeli domain `.com` sendiri).
2.  **Client-Side Storage**: Data tersimpan di LocalStorage browser. Jika cache browser dihapus, data pengaturan (seperti logo/nama perusahaan) mungkin perlu diunggah ulang.
3.  **Ketergantungan Browser**: Performa PDF generation sangat bergantung pada spesifikasi perangkat dan browser pengguna.

## 3. Akumulasi Biaya Pengembangan (Budget: Rp 1.000.000)
Untuk menekan biaya (*Press Budget*) hingga total **Rp 1.000.000**, pengembangan difokuskan pada efisiensi infrastruktur gratis:

| Deskripsi Komponen | Teknologi/Sistem | Nilai (IDR) |
| :--- | :--- | :--- |
| **Logic & Core System** | TypeScript + SheetJS (Excel Engine) | Rp 400.000 |
| **UI/UX & Template Design** | Tailwind CSS v4 + Responsive Layout | Rp 300.000 |
| **Document Export Engine** | PDF & Print System (jsPDF) | Rp 200.000 |
| **Deployment & Hosting** | Setup GitHub + Vercel (Free Domain) | Rp 100.000 |
| **TOTAL AKUMULASI** | | **Rp 1.000.000** |

---
**Strategi Budget**: Penggunaan domain gratis dari Vercel dan penyimpanan berbasis browser memungkinkan aplikasi ini berjalan tanpa biaya server bulanan, sehingga budget Rp 1 Juta sudah mencakup seluruh biaya setup awal dan lisensi penggunaan aplikasi secara permanen.

