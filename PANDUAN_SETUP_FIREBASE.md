# Panduan Lengkap Setup Firebase dari Nol (Untuk Pemula)
Proyek: **FairWork** (Platform Transparansi Kontribusi Tugas Kelompok)

Panduan ini disusun secara runut langkah-demi-langkah bagi Anda yang **belum pernah menggunakan Firebase sama sekali**. Ikuti setiap tahap di bawah ini secara berurutan.

---

## Daftar Isi
1. [Tahap 1: Membuat Proyek Firebase Baru](#tahap-1-membuat-proyek-firebase-baru)
2. [Tahap 2: Mendaftarkan Web App & Mengambil Kunci Config Frontend](#tahap-2-mendaftarkan-web-app--mengambil-kunci-config-frontend)
3. [Tahap 3: Mengaktifkan Firebase Authentication (Login)](#tahap-3-mengaktifkan-firebase-authentication-login)
4. [Tahap 4: Membuat Database Cloud Firestore](#tahap-4-membuat-database-cloud-firestore)
5. [Tahap 5: Mengaktifkan Paket Blaze & Budget Alert (Penting!)](#tahap-5-mengaktifkan-paket-blaze--budget-alert-penting)
6. [Tahap 6: Membuat Cloud Storage (Penyimpanan File Bukti Tugas)](#tahap-6-membuat-cloud-storage-penyimpanan-file-bukti-tugas)
7. [Tahap 7: Mengambil Kredensial Admin SDK (Untuk Backend Node.js)](#tahap-7-mengambil-kredensial-admin-sdk-untuk-backend-nodejs)
8. [Tahap 8: Mengisi File `.env` di Proyek Lokal Anda](#tahap-8-mengisi-file-env-di-proyek-lokal-anda)
9. [Tahap 9: Deploy Security Rules dari Terminal ke Firebase Cloud](#tahap-9-deploy-security-rules-dari-terminal-ke-firebase-cloud)
10. [Tahap 10: Mengisi Data Awal (Seeding) ke Firebase Cloud](#tahap-10-mengisi-data-awal-seeding-ke-firebase-cloud)

---

## Tahap 1: Membuat Proyek Firebase Baru

1. Buka browser dan kunjungi: **[https://console.firebase.google.com/](https://console.firebase.google.com/)**
2. Login menggunakan akun Google Anda.
3. Klik tombol **"Add project"** (atau **"Tambahkan project"** / tanda plus besar).
4. **Beri Nama Proyek:**
   - Masukkan nama proyek, misalnya: `fairwork-app` atau `fairwork-kampus`.
   - Centang persetujuan ketentuan layanan, lalu klik **Continue**.
5. **Google Analytics:**
   - Anda boleh mematikan tombol centang Google Analytics (*Disable Google Analytics*) agar proses setup lebih cepat dan sederhana untuk MVP tugas kuliah, atau biarkan menyala.
   - Klik **Create project** (Buat project).
6. Tunggu sekitar 15–30 detik hingga muncul pesan *"Your new project is ready"*, lalu klik **Continue**. Anda akan diarahkan ke halaman utama (Dashboard) proyek Anda.

---

## Tahap 2: Mendaftarkan Web App & Mengambil Kunci Config Frontend

Di tahap ini, kita akan mendapatkan API Key yang dibutuhkan oleh Next.js (Frontend).

1. Di halaman Dashboard utama (Overview), di bawah teks *"Get started by adding Firebase to your app"*, klik ikon **Web** (ikon `</>`).
2. **Daftarkan Aplikasi (Register app):**
   - Masukkan **App nickname**, misalnya: `fairwork-web`.
   - Kotak pilihan *"Also set up Firebase Hosting"* **tidak perlu dicentang** untuk saat ini.
   - Klik **Register app**.
3. **Salin Konfigurasi Firebase:**
   - Anda akan melihat blok kode JavaScript yang berisi objek `firebaseConfig`:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "fairwork-xxx.firebaseapp.com",
       projectId: "fairwork-xxx",
       storageBucket: "fairwork-xxx.appspot.com",
       messagingSenderId: "123456789...",
       appId: "1:123456789:web:abcdef..."
     };
     ```
   - **Simpan nilai-nilai ini!** Kita akan memasukkannya ke file `.env` di Tahap 8.
4. Klik **Continue to console**.

---

## Tahap 3: Mengaktifkan Firebase Authentication (Login)

Kita perlu mengaktifkan fitur login dengan Email/Password dan Akun Google.

1. Di menu navigasi sebelah kiri, klik **Build** > **Authentication**.
2. Klik tombol **Get started** (Mulai).
3. Anda akan berada di tab **Sign-in method**:
   - **A. Mengaktifkan Email/Password:**
     1. Klik pada baris **Email/Password**.
     2. Geser tombol toggle **Enable** pertama ke posisi aktif. *(Opsi "Email link / passwordless" biarkan nonaktif)*.
     3. Klik **Save** (Simpan).
   - **B. Mengaktifkan Akun Google:**
     1. Klik tombol **Add new provider**, lalu pilih **Google**.
     2. Geser tombol toggle **Enable** ke posisi aktif.
     3. Pada kolom **Project support email**, pilih alamat email Google Anda.
     4. Klik **Save** (Simpan).

---

## Tahap 4: Membuat Database Cloud Firestore

Firestore digunakan untuk menyimpan data user, proyek, milestone, submission, dan review.

1. Di menu kiri, klik **Build** > **Firestore Database**.
2. Klik tombol **Create database** (Buat database).
3. **Database location (Lokasi Server):**
   - Pilih server terdekat dengan Indonesia:
     - `asia-southeast2` (Jakarta) — *Sangat direkomendasikan*
     - atau `asia-southeast1` (Singapura).
   - Klik **Next**.
4. **Security Rules awal:**
   - Pilih **Start in production mode** (Mulai dalam mode produksi).
   - *(Jangan khawatir, aturan keamanan ketat buatan kita akan kita upload di Tahap 9).*
   - Klik **Create** (atau **Enable**).
5. Tunggu beberapa detik sampai dashboard tabel Firestore kosong muncul.

---

## Tahap 5: Mengaktifkan Paket Blaze & Budget Alert (Penting!)

> [!IMPORTANT]
> **Kenapa harus paket Blaze?**
> Cloud Storage dan fitur pengecekan lintas layanan (*cross-service security rules*) pada Firebase mengharuskan project berada di paket **Blaze (Pay as you go)**. 
> 
> **Apakah ini berbayar mahal?**
> **TIDAK.** Firebase menyediakan batas penggunaan gratis bulanan (*Free Tier*) yang sangat besar:
> - Penyimpanan Cloud Storage gratis 5 GB pertama.
> - Pembacaan database Firestore gratis 50.000 read/hari.
> Untuk kebutuhan demo tugas kuliah atau MVP, biayanya adalah **Rp 0 (gratis)**.

1. Di pojok kiri bawah Firebase Console, klik tombol **Upgrade** (di samping tulisan *Spark plan*).
2. Pilih paket **Blaze (Pay as you go)**.
3. Tautkan akun Billing Google Cloud Anda (memerlukan kartu debit/kredit seperti Jenius, Bank Jago, Mandiri, BCA, dll. yang mendukung transaksi online internasional).
4. **Pasang Budget Alert (Wajib agar tidak boncos):**
   - Buka **[Google Cloud Console Billing](https://console.cloud.google.com/billing/)**.
   - Masuk ke menu **Budgets & alerts** > klik **Create budget**.
   - Beri nama: `fairwork-budget-alert`.
   - Masukkan batas nominal kecil, misalnya: **Rp 50.000** atau **$5 USD**.
   - Centang notifikasi email pada ambang 50%, 90%, dan 100%. Klik **Finish**. Jika pemakaian mendekati nominal tersebut, Google akan otomatis mengirim email peringatan.

---

## Tahap 6: Membuat Cloud Storage (Penyimpanan File Bukti Tugas)

Cloud Storage dipakai untuk menampung PDF, Word, atau gambar bukti pengerjaan mahasiswa.

1. Di menu kiri Firebase Console, klik **Build** > **Storage**.
2. Klik tombol **Get started** (Mulai).
3. Pada jendela wizard yang muncul:
   - Pilih **Start in production mode**.
   - Klik **Next**.
4. **Cloud Storage location:**
   - Pilih lokasi yang sama dengan Firestore Anda (`asia-southeast2` Jakarta atau `asia-southeast1`).
   - Klik **Done**.
5. Tunggu beberapa detik hingga tab file bucket kosong muncul.

---

## Tahap 7: Mengambil Kredensial Admin SDK (Untuk Backend Node.js)

Backend API Node.js memerlukan kunci rahasia (*Service Account Key*) untuk membuat data, memverifikasi token login, dan mengeksekusi review.

> [!CAUTION]
> File Service Account Key berisi kunci privat akses penuh ke database Anda. **DILARANG KERAS** mengunggah file ini ke GitHub atau membagikannya ke orang lain!

1. Di Firebase Console, klik ikon **Gerigi (Settings)** di pojok kiri atas (sebelah tulisan *Project Overview*).
2. Pilih **Project settings** (Setelan project).
3. Masuk ke tab **Service accounts** (Akun layanan) di bagian atas.
4. Pastikan radio button **Node.js** terpilih.
5. Klik tombol **Generate new private key** (Buat kunci pribadi baru) > konfirmasi dengan menekan **Generate key**.
6. Browser akan otomatis mengunduh sebuah file berformat `.json` (misalnya: `fairwork-app-firebase-adminsdk-xxx.json`).
7. Buka file `.json` tersebut dengan teks editor (Notepad, VS Code, dll.).
8. **Ubah format isinya menjadi satu baris teks string:**
   - Anda perlu menyalin (copy) seluruh teks JSON tersebut untuk dimasukkan ke variabel `FIREBASE_SERVICE_ACCOUNT` di langkah berikutnya.

---

## Tahap 8: Mengisi File `.env` di Proyek Lokal Anda

Sekarang kembali ke terminal atau text editor proyek `fairwork`:

1. Buat salinan dari `.env.example` menjadi `.env`:
   ```bash
   cd ~/fairwork
   cp .env.example .env
   ```
2. Buka file `.env` dan ganti nilai-nilai placeholder dengan data asli Anda:

   ```bash
   # Diambil dari Tahap 2 (Web App Config)
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAxxxxxxx...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fairwork-app.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=fairwork-app
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fairwork-app.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

   # Set 'false' jika ingin langsung terhubung ke cloud, atau 'true' jika ingin pakai emulator lokal
   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false

   # Diambil dari Tahap 7 (Isi teks JSON Service Account yang sudah Anda unduh)
   # Pastikan seluruh JSON ditulis dalam 1 baris string tanpa spasi terputus
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"fairwork-app","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...","client_email":"firebase-adminsdk-...@fairwork-app.iam.gserviceaccount.com"}

   PORT=5000
   NODE_ENV=development
   ```

---

## Tahap 9: Deploy Security Rules dari Terminal ke Firebase Cloud

File `firestore.rules` dan `storage.rules` yang sudah dibuat dan diuji secara otomatis di repo ini harus diunggah ke Firebase Cloud agar aktif melindungi sistem Anda.

1. **Login ke Akun Firebase via Terminal:**
   ```bash
   firebase login --no-localhost
   ```
   *(Buka link yang diberikan di browser, login dengan akun Google Anda, salin kode otorisasi, lalu tempelkan kembali ke terminal).*

2. **Hubungkan Folder Proyek ke Proyek Cloud Anda:**
   ```bash
   cd ~/fairwork
   firebase use --add
   ```
   - Terminal akan menampilkan daftar proyek Firebase Anda.
   - Pilih proyek yang tadi Anda buat di Tahap 1 (misal `fairwork-app`).
   - Beri alias, misalnya: `default`.

3. **Deploy Rules ke Cloud:**
   Jalankan perintah ini:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```
   - Terminal akan mengompilasi dan mengunggah aturan. Jika berhasil, akan muncul tanda centang hijau:
     `✔ Deploy complete!`

---

## Tahap 10: Mengisi Data Awal (Seeding) ke Firebase Cloud

Setelah database dan rules aktif di Cloud, isi akun demo dan proyek awal dengan menjalankan skrip seed bawaan proyek:

```bash
cd ~/fairwork
npm run seed
```

Skrip ini akan secara otomatis:
1. Mendaftarkan 5 akun demo mahasiswa di Firebase Authentication:
   - `budi.santoso@contoh-kampus.ac.id` (Leader)
   - `siti.rahmah@contoh-kampus.ac.id` (Member)
   - `andi.pratama@contoh-kampus.ac.id` (Member)
   - `dewi.lestari@contoh-kampus.ac.id` (Member)
   - `rizky.fauzi@contoh-kampus.ac.id` (Member)
   *(Password default semua akun: `Password123!`)*
2. Membuat dokumen proyek fiktif *"Software Engineering Final Report"*.
3. Membuat 4 milestone dengan berbagai status pengerjaan.
4. Membuat contoh berkas submission dan review rekan sejawat.

---

## ✅ Selesai!

Sekarang seluruh komponen Firebase proyek **FairWork** Anda telah aktif:
- Pengguna dapat login via Email atau Google.
- Bukti tugas dapat diunggah dengan aman ke Cloud Storage (maks 10 MB).
- Database Firestore terlindungi oleh security rules berbasis keanggotaan kelompok.
- Backend Node.js siap memproses review dan menghitung ringkasan kontribusi!
