# Log Percakapan & Dokumentasi Teknis Setup Firebase: FairWork

Dokumentasi ini mencatat riwayat interaksi, requirement sistem, keputusan desain, implementasi teknis, dan hasil pengujian security rules untuk platform **FairWork** (sebelum pembahasan autentikasi password GitHub).

---

## 1. Permintaan Awal Pengguna (User Request)

### Deskripsi Proyek
Membangun infrastruktur backend dan keamanan Firebase untuk platform **FairWork** — platform web untuk transparansi kontribusi mahasiswa dalam tugas kelompok. Alur kerja:
1. Leader membuat proyek dan milestone.
2. Penanggung jawab milestone mengunggah bukti pengerjaan ke Cloud Storage.
3. Rekan satu tim melakukan peer review (*Verify* atau *Request Revision*).
4. Sistem menghitung dan menampilkan ringkasan kontribusi masing-masing anggota.

### Spesifikasi Stack & Batasan
- **Frontend:** Next.js (React), responsif.
- **Backend:** Node.js API untuk penegakan aturan bisnis (*state transitions*, validasi review, flag, summary).
- **Firebase:** Authentication (Email/Password & Google), Cloud Firestore, Cloud Storage.
- **Kredensial:** Tanpa hardcode, service account dibaca dari variabel `FIREBASE_SERVICE_ACCOUNT` (JSON string).
- **Data:** Menggunakan data demo fiktif (bukan data mahasiswa asli).

### Model Data Firestore (Root Collections)
- `users`: `uid`, `nama`, `email`, `createdAt`
- `projects`: `id`, `judul`, `mataKuliah`, `tenggat`, `leaderId`, `memberIds` (array 3-5 orang)
- `milestones`: `id`, `projectId`, `judul`, `tenggat`, `assigneeId`, `status` (`todo` | `submitted` | `verified` | `revision_requested`), `bobot` (default 1)
- `submissions`: `id`, `projectId`, `milestoneId`, `memberId`, `versi`, `deskripsi`, `fileRefs`, `createdAt`
- `reviews`: `id`, `projectId`, `submissionId`, `reviewerId`, `keputusan` (`verify` | `revision`), `komentar`, `createdAt`
- `activity`: `id`, `projectId`, `tipe` (`upload` | `review` | `reminder`), `aktorId`, `createdAt`

### Aturan Bisnis Server
1. Akses baca proyek dan turunannya hanya untuk anggota yang tercantum di `memberIds`.
2. Penanggung jawab tugas dilarang memverifikasi pekerjaannya sendiri.
3. Komentar wajib diisi pada aksi *Verify* maupun *Request Revision*.
4. Cukup 1 verifikasi dari anggota lain untuk mengubah status milestone menjadi `verified`.
5. Versi lama submission bersifat permanen/immutable (tidak boleh diubah atau dihapus).
6. File yang diizinkan: PDF, DOCX, TXT, PNG, JPG dengan ukuran maksimal 10 MB per file.

---

## 2. Klarifikasi Desain & Keputusan Arsitektur

Sebelum penulisan kode dilakukan, diajukan 3 pertanyaan klarifikasi desain:

1. **Struktur Koleksi Firestore:**
   - *Pilihan terpilih:* **Root-level collections** (`/projects`, `/milestones`, `/submissions`, `/reviews`, `/activity`) dengan referensi `projectId` di setiap dokumen.
2. **Arsitektur API Backend:**
   - *Pilihan terpilih:* **Express.js** (Middleware standar Node.js `(req, res, next)` yang siap digunakan untuk standalone server maupun Cloud Functions).
3. **Lokasi Folder Proyek:**
   - *Pilihan terpilih:* Subfolder `./fairwork` (`/home/muhammadrafishidqi56/fairwork`).

---

## 3. Implementasi Berkas & Komponen

### A. Inisialisasi Firebase Client SDK
- **File:** `src/client/firebase.js`
- **Fitur:** 
  - Membaca config dari env `NEXT_PUBLIC_FIREBASE_*`.
  - Pola Singleton mencegah re-instansiasi saat Fast Refresh Next.js.
  - Otomatis menghubungkan ke emulator lokal jika `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`.

### B. Inisialisasi Firebase Admin SDK
- **File:** `src/server/firebaseAdmin.js`
- **Fitur:**
  - Membaca environment variable `FIREBASE_SERVICE_ACCOUNT` (JSON string).
  - Melakukan sanitasi `\n` pada `private_key`.
  - Fallback otomatis ke Firebase Local Emulator jika mendeteksi environment emulator, atau ke Application Default Credentials (ADC).

### C. Middleware Autentikasi Node.js
- **File:** `src/server/middleware/authMiddleware.js`
- **Fitur:**
  - Memverifikasi header `Authorization: Bearer <token>` via `adminAuth.verifyIdToken(token)`.
  - Mengembalikan status HTTP 401 Unauthorized jika token tidak ada, cacat, atau kedaluwarsa.
  - Menyuntikkan decoded user (`uid`, `email`, `name`) ke object `req.user`.
  - Menyediakan fungsi pembantu `verifyNextRequest` untuk kompatibilitas Next.js Route Handlers.

### D. Reference Express API Server
- **File:** `src/server/index.js`
- **Fitur:**
  - Endpoint `POST /api/submissions/:submissionId/review`:
    - Memvalidasi review harus memiliki komentar.
    - Menolak review jika reviewer adalah penanggung jawab submission itu sendiri.
    - Memverifikasi reviewer terdaftar sebagai anggota proyek.
    - Melakukan atomic batch write untuk menyimpan review, mengupdate status milestone, dan mencatat log `activity`.

### E. Firestore Security Rules
- **File:** `firestore.rules`
- **Aturan:**
  - Koleksi `users`: Pengguna login hanya dapat mengedit dokumen profil miliknya sendiri (`request.auth.uid == userId`).
  - Koleksi `projects`: Anggota dapat membaca dokumen jika `request.auth.uid in resource.data.memberIds`.
  - Koleksi `milestones`, `submissions`, `reviews`, `activity`: Anggota dapat membaca jika UID terdaftar pada `projects/{projectId}.memberIds`.
  - Seluruh operasi `write` dari klien ditolak (`allow write: if false;`), menegakkan aturan bahwa seluruh manipulasi data wajib melalui Admin SDK.

### F. Cloud Storage Security Rules
- **File:** `storage.rules`
- **Aturan:**
  - Path: `projects/{projectId}/milestones/{milestoneId}/{allPaths=**}`
  - Baca: Diizinkan hanya jika `isProjectMember(projectId)` via cross-service Firestore lookup.
  - Unggah: Diizinkan hanya untuk file baru (`resource == null`), ukuran <= 10 MB, dan MIME type sesuai whitelist (PDF, Word DOCX/DOC, Text TXT, Image PNG, JPEG).
  - Update & Delete: Selalu ditolak (`allow update, delete: if false;`) untuk menjaga integritas bukti kerja.

### G. Konfigurasi Emulator Suite & Script NPM
- **File:** `firebase.json` & `package.json`
- **Port Emulator:**
  - Authentication: `9099`
  - Firestore: `8080`
  - Storage: `9199`
  - Emulator UI: `4000`
- **NPM Scripts:**
  - `npm test`: Menjalankan suite pengujian security rules end-to-end dengan emulator.
  - `npm run emulators`: Menjalankan Firebase Emulator Suite.
  - `npm run seed:emulator`: Melakukan seeding data dummy fiktif ke emulator.
  - `npm start`: Menjalankan Express API server.

### H. Seeding Data Demo Fiktif
- **File:** `src/scripts/seed.js`
- **Data yang Dihasilkan:**
  - 1 Akun Leader: Budi Santoso (`user_leader_budi`)
  - 4 Akun Anggota: Siti Rahmah, Andi Pratama, Dewi Lestari, Rizky Fauzi
  - 1 Proyek: "Software Engineering Final Report" (IF-301)
  - 4 Milestone: Variasi status `verified`, `submitted`, `revision_requested`, dan `todo`
  - Contoh dokumen Submissions, Reviews, dan Activity log

### I. Konfigurasi Lingkungan & Keamanan Git
- **File:** `.env.example` (template konfigurasi tanpa kredensial asli)
- **File:** `.gitignore` (memastikan `.env*`, `*serviceAccount*.json`, node_modules, dan debug logs tidak ter-commit)

---

## 4. Hasil Pengujian Otomatis (Rules Unit Testing)

Pengujian dilakukan menggunakan `@firebase/rules-unit-testing` dan test runner native Node.js pada file `test/rules.test.js`.

### Hasil Eksekusi:
```text
✔ FairWork Firebase Security Rules Tests
  ✔ Kasus (a): Akses Anggota Proyek (Anggota membaca proyek & milestone)
  ✔ Kasus (b): Penolakan Akses Non-Anggota (Non-anggota & tamu ditolak membaca dokumen & Storage)
  ✔ Kasus (c): Immutability & Penolakan Write Klien (Klien ditolak menulis langsung ke reviews & submissions)
  ✔ Kasus (d): Validasi Upload Cloud Storage (PDF/PNG valid diizinkan; .exe, >10MB, dan overwrite ditolak)
  ✔ Koleksi Users: Kepemilikan Profil (Hanya pemilik yang dapat mengubah profilnya)

ℹ tests 16 | suites 6 | pass 16 | fail 0 | cancelled 0
✔ Script exited successfully (code 0)
```

---

## 5. Tanya Jawab Terkait Lokasi & Setup Repositori

1. **Pertanyaan:** *"Hasil yg kamu kerjakan tadi dibuat dimana?"*
   - **Jawaban:** Dibuat di subfolder `/home/muhammadrafishidqi56/fairwork` (atau `~/fairwork`).

2. **Pertanyaan:** *"Di lokal? Itu foldernya dimana?"*
   - **Jawaban:** Berada di environment Linux Google Cloud Shell aktif saat ini di path `~/fairwork`. Dapat diakses lewat terminal (`cd ~/fairwork`), melalui Cloud Shell IDE Explorer di panel kiri, atau dipindahkan ke komputer lokal via git / zip download.

3. **Pertanyaan:** *"Nama repo didapetin dari mana?"*
   - **Jawaban:** Nama repo ditentukan bebas oleh pengguna saat membuat repository baru di GitHub (melalui tombol *New repository* di `github.com/new`, misalnya diberi nama `fairwork`). URL repo kemudian disalin untuk konfigurasi git remote.

---

## 6. Checklist Langkah Manual di Firebase Console

1. **Authentication:** Aktifkan provider *Email/Password* dan *Google* di menu *Authentication > Sign-in method*.
2. **Authorized Domains:** Tambahkan domain hosting aplikasi di *Authentication > Settings > Authorized domains*.
3. **Upgrade Paket Blaze:** Upgrade project ke paket pay-as-you-go Blaze agar fitur Cloud Storage dan cross-service security rules aktif.
4. **Budget Alert:** Pasang batas anggaran (misal: $5/bulan) di Google Cloud Billing untuk mencegah lonjakan biaya.
5. **Service Account Key:** Unduh file JSON private key dari *Project Settings > Service accounts*, lalu konversikan ke string satu baris untuk environment variable `FIREBASE_SERVICE_ACCOUNT`.
