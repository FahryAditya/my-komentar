# 💌 My Komentar — Kotak Pesan & Komentar Privat

Website modern untuk menampung pesan, kritik, saran, dan komentar secara privat dari pengunjung. Pengunjung umum hanya dapat mengirimkan pesan tanpa bisa melihat komentar orang lain, sementara Admin memiliki akses eksklusif ke Dashboard terproteksi untuk membaca, menyortir, dan mengelola semua masukan yang masuk.

---

## ✨ Fitur Utama

### 👤 Pengunjung (Halaman Publik `/`)
- **Kirim Pesan & Masukan**: Form interaktif dengan nama (atau opsi **🕶️ Kirim Anonim**).
- **Pilihan Kategori**: Saran 💡, Kritik & Masukan 🔥, Pesan Rahasia 💌, Pertanyaan ❓, Apresiasi ⭐, Lainnya 💭.
- **Penilaian Kepuasan**: Interaktif rating bintang 1–5 ⭐.
- **Jaminan Privasi 100%**: Pengunjung hanya dapat mengirim komentar dan tidak memiliki akses ke inbox/daftar komentar orang lain.

### 🛡️ Admin Dashboard (`/admin`)
- **Proteksi Akses PIN**: Keamanan akses PIN admin (Default PIN: `admin123` dan dapat diubah di dashboard).
- **Inbox & Status**: Tampilan pesan lengkap dengan status belum dibaca, berbintang (favorit), rating, dan waktu pengiriman.
- **Manajemen Komentar**:
  - Tandai sudah dibaca / belum dibaca.
  - Tandai favorit (Star).
  - 1-Klik Salin teks pesan.
  - Hapus komentar (dengan konfirmasi keamanan).
- **Pencarian & Filter**: Pencarian live berdasarkan nama atau isi pesan, filter kategori, dan tab status.
- **Export Data**: Ekspor seluruh komentar ke format **CSV** atau **JSON**.
- **Ganti PIN Admin**: Fitur ubah PIN langsung dari menu pengaturan dashboard.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan Dark Glassmorphism Design
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [PostgreSQL (Neon Serverless)](https://neon.tech/)

---

## 🚀 Memulai (Local Setup)

1. **Clone repository**:
   ```bash
   git clone https://github.com/FahryAditya/my-komentar.git
   cd my-komentar
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**:
   Buat file `.env` di root folder:
   ```env
   DATABASE_URL=postgresql://username:password@host/neondb?sslmode=require
   ```

4. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000) di browser.
   - Halaman Publik: `http://localhost:3000/`
   - Dashboard Admin: `http://localhost:3000/admin` (Default PIN: `admin123`)

---

## 📄 Lisensi
Distributed under the MIT License.
