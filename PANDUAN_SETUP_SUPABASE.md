# Panduan Lengkap Setup Supabase dari Nol (Untuk Pemula)
Proyek: **FairWork** (Platform Transparansi Kontribusi Tugas Kelompok)  
Tim: **Manuk Hiber** | STACK 2026 (Case 1: Smarter Campus and Learning) | Versi 1.1

Panduan ini disusun secara runut langkah-demi-langkah bagi Anda yang **belum pernah menggunakan Supabase sama sekali**. Ikuti setiap tahap di bawah ini secara berurutan untuk menyiapkan backend PostgreSQL, Authentication, Storage, dan Row Level Security (RLS).

---

## Daftar Isi
1. [Tahap 1: Membuat Akun & Proyek Supabase Baru](#tahap-1-membuat-akun--proyek-supabase-baru)
2. [Tahap 2: Mengambil URL & Kunci API (Anon Key)](#tahap-2-mengambil-url--kunci-api-anon-key)
3. [Tahap 3: Konfigurasi Supabase Authentication (Login Mahasiswa)](#tahap-3-konfigurasi-supabase-authentication-login-mahasiswa)
4. [Tahap 4: Menjalankan Migrasi Database & Security Rules (RLS)](#tahap-4-menjalankan-migrasi-database--security-rules-rls)
5. [Tahap 5: Menyiapkan Supabase Storage (Penyimpanan Bukti Kerja)](#tahap-5-menyiapkan-supabase-storage-penyimpanan-bukti-kerja)
6. [Tahap 6: Mengaktifkan Supabase Realtime (Sinkronisasi Papan Milestone)](#tahap-6-mengaktifkan-supabase-realtime-sinkronisasi-papan-milestone)
7. [Tahap 7: Mengisi Data Demo Skenario Final Day (Seeding)](#tahap-7-mengisi-data-demo-skenario-final-day-seeding)
8. [Tahap 8: Menghubungkan Backend ke Next.js (`.env.local`)](#tahap-8-menghubungkan-backend-ke-nextjs-envlocal)
9. [Tahap 9: Menjalankan & Menguji Aplikasi di Lokal](#tahap-9-menjalankan--menguji-aplikasi-di-lokal)
10. [Tahap 10: Tips Kritis Free Tier Supabase (Pencegahan Pause Jelang Demo)](#tahap-10-tips-kritis-free-tier-supabase-pencegahan-pause-jelang-demo)

---

## Tahap 1: Membuat Akun & Proyek Supabase Baru

1. Buka browser dan kunjungi: **[https://supabase.com/](https://supabase.com/)**
2. Klik tombol **"Start your project"** atau **"Sign In"**.
3. Login menggunakan akun **GitHub** Anda.
4. Di halaman dashboard Supabase, klik tombol **"New Project"** (hijau).
5. **Isi Formulir Pembuatan Proyek:**
   * **Organization:** Pilih nama organization default akun Anda.
   * **Name:** Masukkan nama proyek, misalnya: `fairwork-app` atau `fairwork-stack2026`.
   * **Database Password:** Masukkan password yang kuat (misal kombinasi huruf, angka, simbol).  
     *(PENTING: Catat password ini di tempat aman!)*
   * **Region:** Pilih server terdekat dengan Indonesia untuk performa tercepat:
     * **Singapore (`ap-southeast-1`)** — *Sangat direkomendasikan*.
   * **Pricing Plan:** Pilih **Free Plan** (Rp 0 / gratis).
6. Klik **"Create new project"**.
7. Tunggu sekitar 1–2 menit sementara Supabase menyiapkan database PostgreSQL, auth server, dan storage Anda. Setelah selesai, Anda akan diarahkan ke Dashboard proyek.

---

## Tahap 2: Mengambil URL & Kunci API (Anon Key)

Frontend Next.js membutuhkan **Project URL** dan **Anon/Public Key** untuk berkomunikasi secara aman dengan Supabase.

1. Di menu navigasi sidebar sebelah kiri paling bawah, klik ikon **Gerigi (Project Settings)**.
2. Di dalam menu Project Settings, klik tab **API** (di bawah kategori Configuration).
3. Anda akan melihat bagian **Project API Keys**:
   * **Project URL:** Contoh: `https://abcdefghijklm.supabase.co`  
     $\rightarrow$ Salin (*copy*) nilai ini.
   * **`anon` `public` key:** String panjang yang diawali `eyJhbGciOi...`  
     $\rightarrow$ Salin (*copy*) nilai ini.
4. *(Catatan Penting: Jangan gunakan `service_role` `secret` key di aplikasi browser frontend! Hanya gunakan `anon` key).*

---

## Tahap 3: Konfigurasi Supabase Authentication (Login Mahasiswa)

Agar proses registrasi dan demo berjalan lancar tanpa terhambat verifikasi email:

1. Di menu sidebar kiri, klik ikon orang **Authentication**.
2. Masuk ke sub-menu **Providers** > klik **Email**.
3. **Pengaturan Email Auth:**
   * Pastikan toggle **Enable Email provider** dalam kondisi **ON**.
   * Matikan toggle **Confirm email** (*Disable Confirm Email*).  
     *(Alasan: Di lingkungan demo kompetisi, jika Confirm Email aktif, pendaftar baru harus membuka inbox email terlebih dahulu sebelum bisa login. Mematikan fitur ini membuat akun langsung aktif begitu mendaftar).*
   * Klik tombol **Save** di pojok kanan bawah.

---

## Tahap 4: Menjalankan Migrasi Database & Security Rules (RLS)

Seluruh skema tabel (`profiles`, `projects`, `project_members`, `milestones`, `submissions`, `reviews`, `activity`), trigger otomatis, aturan anti-free-riding, dan Row Level Security (RLS) sudah disiapkan dalam satu file SQL di repositori.

1. Di menu sidebar kiri Supabase, klik ikon terminal/kode **SQL Editor**.
2. Klik tombol **"+ New query"** (atau create a new query).
3. Buka file berikut dari repositori Anda di teks editor:  
   [`supabase/migrations/20261122000000_fairwork_initial_schema.sql`](supabase/migrations/20261122000000_fairwork_initial_schema.sql)
4. Salin (*copy*) seluruh isi teks SQL dari file tersebut.
5. Tempel (*paste*) ke dalam kotak editor SQL Supabase di browser.
6. Klik tombol **"Run"** (hijau di pojok kanan bawah) atau tekan tombol `Ctrl + Enter` (`Cmd + Enter` di Mac).
7. Perhatikan bagian bawah editor: jika muncul pesan hijau **"Success. No rows returned"**, berarti:
   * 7 Tabel utama telah berhasil dibuat.
   * Row Level Security (RLS) aktif melindungi seluruh data antar-tim.
   * Trigger anti-free-riding (penanggung jawab dilarang mereview tugasnya sendiri) telah aktif di Postgres.
   * Fungsi penghitung kontribusi (`get_project_contribution_summary`) telah terpasang.

---

## Tahap 5: Menyiapkan Supabase Storage (Penyimpanan Bukti Kerja)

File skrip migrasi di Tahap 4 telah otomatis mendaftarkan bucket `proof-of-work`. Namun untuk memastikannya:

1. Di menu sidebar kiri, klik ikon silinder **Storage**.
2. Cek apakah bucket bernama **`proof-of-work`** sudah ada di daftar bucket.
3. Jika belum ada:
   * Klik **"New bucket"**.
   * Beri nama bucket persis: `proof-of-work`.
   * Pilihan **Public bucket** biarkan **OFF** (karena bukti pengerjaan mahasiswa bersifat privat dan hanya boleh diakses oleh anggota tim proyek).
   * Pada **File size limit**, masukkan `10MB`.
   * Pada **Allowed MIME types**, masukkan:
     ```text
     application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, text/plain, image/png, image/jpeg
     ```
   * Klik **Save**.
4. Di tab **Policies** pada Storage, pastikan policy akses anggota tim aktif (sudah dikonfigurasi lewat SQL di Tahap 4).

---

## Tahap 6: Mengaktifkan Supabase Realtime (Sinkronisasi Papan Milestone)

Supabase Realtime memungkinkan papan Kanban bergerak secara langsung (*live*) di layar seluruh anggota tim ketika seseorang mengunggah bukti kerja atau memverifikasi tugas.

1. Di sidebar kiri, klik **Database** > pilih menu **Replication**.
2. Pada tabel publikasi `supabase_realtime`:
   * Klik tombol angka sumber tabel (*Source*).
   * Pastikan tabel **`milestones`** dan **`activity`** dalam kondisi toggle **ON** (hijau).
   * *(Skrip SQL di Tahap 4 sudah menyertakan perintah `alter publication supabase_realtime add table ...` sehingga langkah ini untuk memvalidasi)*.

---

## Tahap 7: Mengisi Data Demo Skenario Final Day (Seeding)

Supaya pada saat demo di hadapan juri sistem sudah memiliki data proyek fiktif *"Software Engineering Final Report"* dengan 4 mahasiswa:

1. Kembali ke **SQL Editor** di Supabase Console.
2. Klik **"+ New query"**.
3. Buka file berikut dari repositori lokal Anda:  
   [`supabase/seed.sql`](supabase/seed.sql)
4. Salin (*copy*) seluruh kodenya, tempel (*paste*) ke SQL Editor Supabase.
5. Klik **"Run"**.
6. Data 4 mahasiswa (Rian Leader, Alicia Member A, Brian Member B, Cindy Member C), 4 milestone berbagai status, submission file, dan review akan langsung terisi ke database.

---

## Tahap 8: Menghubungkan Backend ke Next.js (`.env.local`)

Sekarang hubungkan frontend lokal Anda dengan database Supabase di cloud:

1. Buka terminal di folder proyek FairWork:
   ```bash
   cd /home/muhammadrafishidqi56/fairwork
   ```
2. Buat file `.env.local` (salin dari `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
3. Buka file `.env.local` menggunakan teks editor Anda (VS Code, Nano, dll.), lalu isi dengan nilai yang didapat dari **Tahap 2**:

   ```env
   # Ganti dengan Project URL dari Supabase Console (Settings > API)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co

   # Ganti dengan anon public key dari Supabase Console (Settings > API)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Opsional (hanya di sisi server bila diperlukan script admin)
   SUPABASE_SERVICE_ROLE_KEY=
   ```
4. Simpan file `.env.local`.

---

## Tahap 9: Menjalankan & Menguji Aplikasi di Lokal

1. Jalankan development server Next.js:
   ```bash
   npm run dev
   ```
2. Buka browser di: **[http://localhost:3000](http://localhost:3000)**
3. Anda akan melihat indikator status di pojok kiri atas bertuliskan:
   `● Supabase Live Connected` *(atau Interactive Demo Mode bila berjalan offline)*.
4. **Coba Skenario Pengujian:**
   * Di bar atas, gunakan **1-Click Persona Switcher** untuk berpindah antar mahasiswa.
   * Pilih **Brian Pratama (Member B)** $\rightarrow$ Milestone miliknya (*Milestone Board UI*) dalam status `Submitted`. Brian tidak bisa mereview pekerjaannya sendiri.
   * Ganti persona ke **Alicia Amanda (Member A)** $\rightarrow$ Klik tombol **Peer Review Submission** pada tugas Brian.
   * Pilih **Verify**, ketik komentar pengujian, klik **Confirm Verification**.
   * Papan milestone akan berpindah ke kolom **Verified**, dan di tab **Contribution Summary**, angka persentase Brian langsung bertambah otomatis!
   * Klik tombol **Export PDF Report** untuk mengunduh laporan PDF A4 siap cetak.

---

## Tahap 10: Tips Kritis Free Tier Supabase (Pencegahan Pause Jelang Demo)

> [!WARNING]
> **Kebijakan Free Tier Supabase:**
> Proyek Supabase pada paket gratis (*Free Plan*) akan **otomatis dijeda (paused)** oleh sistem Supabase jika **tidak ada aktivitas API / query database sama sekali selama 7 hari berturut-turut**.
> 
> **Langkah Pencegahan Sebelum Final Day (16 Desember 2026):**
> 1. Buka dashboard Supabase Anda minimal **1–2 hari sebelum hari presentasi final**.
> 2. Jika proyek sempat terjeda, akan muncul tombol kuning **"Restore project"** di dashboard Supabase. Klik tombol tersebut (proses restore memakan waktu ~1–2 menit).
> 3. Buka aplikasi FairWork Anda di browser dan lakukan satu interaksi (misalnya klik milestone) agar ada request database yang masuk.
> 4. **Fitur Pengaman FairWork:** Jika Supabase mendadak tidak dapat diakses saat presentasi, FairWork dilengkapi sistem ketahanan *Interactive Demo Mode* dengan data lokal lengkap, sehingga demo di hadapan juri dijamin 100% tetap berjalan mulus tanpa error.

---

## Ringkasan Perbandingan: Firebase vs Supabase di FairWork

| Aspek Teknis | Versi Lama (Firebase) | Versi Baru (Supabase) | Keuntungan di FairWork |
| :--- | :--- | :--- | :--- |
| **Model Data** | NoSQL Document (Firestore) | Relational SQL (PostgreSQL) | Sangat mudah menghitung agregasi bobot kontribusi (%) via query SQL |
| **Keamanan** | Firebase Security Rules | Postgres Row Level Security (RLS) | Aturan keamanan langsung di database engine, standar industri enterprise |
| **Anti-Free-Riding** | Logika Express.js Backend | PostgreSQL Trigger (`trg_validate_reviewer`) | Mustahil di-bypass bahkan jika ditembak langsung via API HTTP |
| **Realtime** | Firestore Snapshot Listener | Postgres CDC (`supabase_realtime`) | Sinkronisasi papan Kanban instan tanpa beban komputasi berat |
| **Ekspor Laporan** | Manual client scraping | SQL View + jsPDF Client Engine | Laporan A4 rapi dengan tanda tangan integritas akademik |

Panduan ini siap digunakan oleh seluruh anggota tim **Manuk Hiber** untuk kolaborasi pengembangan proyek FairWork!
