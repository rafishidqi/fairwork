# PRD dan MVP: FairWork

Tim Manuk Hiber | STACK 2026 (Case 1: Smarter Campus and Learning) | Versi 1.1 (Supabase) | 22 November 2026 | Status: Draft

## 1. Ringkasan Produk

**FairWork** adalah platform web yang membuat kontribusi individu dalam tugas kelompok kuliah terlihat. Tim memecah tugas menjadi milestone, anggota mengunggah bukti kerja (proof of work), teman satu tim memverifikasi setiap submission, lalu sistem menghasilkan ringkasan kontribusi per anggota yang bisa dilampirkan saat mengumpulkan tugas ke dosen.

**Masalah.** Beban kerja tidak merata karena ada anggota yang tidak berkontribusi (free-riding) atau mengumpulkan teks buatan AI tanpa dicek. Anggota lain menanggung kerja tambahan dan stres tenggat, sementara dosen hanya melihat hasil akhir.

**Pernyataan nilai.** Di FairWork, kontribusi tiap anggota tercatat, diverifikasi teman, dan bisa ditunjukkan sebagai bukti.

**Pembeda.** Trello, Notion, dan Google Docs mencatat tugas dan suntingan, tetapi tidak mewajibkan teman memverifikasi pekerjaan dan tidak menghasilkan ringkasan kontribusi per anggota.

## 2. Tujuan, Non-Tujuan, dan Metrik

### 2.1 Tujuan

1. Anggota tim bisa membuat proyek, membagi milestone, mengunggah bukti kerja, dan memverifikasi satu sama lain dalam satu alur yang berjalan end to end.
2. Setiap milestone yang selesai punya jejak yang dapat diperiksa: siapa mengerjakan, apa buktinya, siapa yang memverifikasi.
3. Tim dapat menghasilkan ringkasan kontribusi per anggota untuk dilampirkan ke dosen.
4. Prototype berfungsi untuk satu skenario utama pada Final Day (16 Des 2026).

### 2.2 Non-tujuan (versi pertama)

- FairWork tidak memberi nilai atau menentukan siapa yang "malas". Keputusan nilai tetap di tangan dosen.
- Tidak ada deteksi penulis AI. Flag hanya pengingat bagi reviewer.
- Tidak ada integrasi LMS, aplikasi mobile native, atau dukungan multi-kampus.
- Tidak ada akun dosen. Tim yang melampirkan ringkasan.

### 2.3 Metrik keberhasilan (target awal, dapat disesuaikan)

| Tahap | Metrik | Target awal |
| --- | --- | --- |
| Final Day | Skenario utama (buat proyek, unggah, verifikasi, ringkasan) selesai tanpa error di demo | Berhasil 3 kali berturut-turut |
| Uji kegunaan (13-15 Des) | Persentase penyelesaian tugas pada 4 tugas utama | 80% atau lebih |
| Uji kegunaan | Skor System Usability Scale (SUS) | 68 atau lebih (rata-rata umum) |
| Pilot (setelah Final Day) | Milestone dengan proof of work | 70% atau lebih |
| Pilot | Milestone yang diverifikasi teman | 70% atau lebih |
| Pilot | Persepsi keadilan (survei singkat, skala 1-5) | Lebih tinggi dari tugas kelompok sebelumnya |

Angka target di atas adalah asumsi perencanaan, bukan hasil. Jangan dilaporkan sebagai hasil nyata.

## 3. Pengguna dan Persona

| Persona | Deskripsi | Kebutuhan utama |
| --- | --- | --- |
| **Team Leader** (mahasiswa) | Membuat proyek dan membagi milestone | Pembagian kerja yang adil, pantau progres, ringkasan untuk dosen |
| **Team Member** (mahasiswa) | Mengerjakan milestone dan mereview teman | Bukti kerja tercatat, tahu apa yang harus dikerjakan, review yang jelas |
| **Dosen / TA** (pengguna tidak langsung) | Menerima ringkasan kontribusi | Gambaran partisipasi individu tanpa memantau chat tim |

Pengguna target: mahasiswa tahun 1 sampai 4 pada tugas kelompok berbasis proyek, tim 3 sampai 5 orang. Peran Leader dan Member dipegang oleh mahasiswa; Leader juga seorang anggota.

## 4. User Stories

| ID | Sebagai | Saya ingin | Agar | Prioritas |
| --- | --- | --- | --- | --- |
| US-1 | Mahasiswa | masuk dengan akun | data saya hanya bisa diakses tim saya | Must |
| US-2 | Leader | membuat proyek dan mengundang anggota | tim terkumpul di satu tempat | Must |
| US-3 | Leader | membuat milestone dengan tenggat dan penanggung jawab | pembagian kerja jelas | Must |
| US-4 | Member | melihat milestone saya dan status semua milestone | tahu apa yang harus dikerjakan | Must |
| US-5 | Member | mengunggah file dan deskripsi sebagai bukti kerja | pekerjaan saya tercatat | Must |
| US-6 | Member | memverifikasi atau meminta revisi submission teman dengan komentar | kualitas pekerjaan dicek | Must |
| US-7 | Leader/Member | melihat ringkasan kontribusi per anggota | punya bukti kontribusi untuk dosen | Must |
| US-8 | Member | menerima pengingat sebelum tenggat | tidak terlambat | Should |
| US-9 | Reviewer | melihat notifikasi jika teks tampak ditempel tanpa diedit | tahu bagian mana yang perlu dibaca lebih teliti | Should |
| US-10 | Leader | mengunduh ringkasan dalam bentuk PDF | mudah dilampirkan ke dosen | Should |
| US-11 | Leader | memberi bobot pada milestone | milestone besar dihargai lebih | Could |

## 5. Persyaratan Fungsional

### FR-1 Autentikasi dan tim (Must)

- Pengguna dapat mendaftar dan masuk lewat Supabase Auth (email dan password, atau Google sign-in).
- Pengguna hanya dapat melihat proyek yang ia ikuti.
- **Kriteria penerimaan:** pengguna yang bukan anggota tidak dapat membuka halaman atau data proyek, termasuk lewat URL langsung atau query langsung ke API Supabase.

### FR-2 Proyek (Must)

- Leader membuat proyek: judul, mata kuliah, tenggat akhir, dan daftar anggota (3 sampai 5 orang).
- **Kriteria penerimaan:** setelah dibuat, proyek muncul di daftar proyek semua anggota.

### FR-3 Milestone dan papan milestone (Must)

- Leader membuat, mengubah, dan menghapus milestone: judul, tenggat, penanggung jawab.
- Papan menampilkan milestone dalam kolom To Do, Submitted, Verified, dengan label "Revision requested" dan "Overdue" bila relevan.
- Pembaruan status disinkronkan ke semua anggota lewat Supabase Realtime.
- **Kriteria penerimaan:** perubahan status pada satu milestone langsung terlihat di papan semua anggota.

### FR-4 Unggah bukti kerja (Must)

- Penanggung jawab mengunggah satu atau lebih file dan mengisi deskripsi singkat "Apa yang saya kerjakan".
- Tipe file: PDF, DOCX, TXT, PNG, JPG; maksimal 10 MB per file.
- File disimpan di bucket private Supabase Storage; akses lewat signed URL dan hanya untuk anggota proyek.
- Setiap unggahan disimpan sebagai versi baru dengan cap waktu; versi lama tidak dihapus.
- **Kriteria penerimaan:** submission tersimpan dengan nomor versi dan waktu; status milestone berubah ke Submitted.

### FR-5 Verifikasi teman (Must)

- Anggota lain (bukan penanggung jawab) dapat memilih Verify atau Request Revision.
- Komentar wajib diisi pada kedua pilihan.
- Satu verifikasi dari satu anggota lain sudah cukup untuk status Verified (versi MVP).
- Request Revision mengembalikan milestone ke penanggung jawab; setelah unggah ulang, status kembali Submitted.
- Aturan "penanggung jawab tidak boleh memverifikasi pekerjaannya sendiri" ditegakkan di database (RLS policy atau constraint), bukan hanya di antarmuka.
- **Kriteria penerimaan:** penanggung jawab tidak dapat memverifikasi pekerjaannya sendiri, termasuk lewat request langsung ke API; riwayat review (siapa, kapan, keputusan, komentar) tersimpan dan terlihat.

### FR-6 Ringkasan kontribusi (Must)

- Tabel per anggota: milestone ditugaskan, milestone Verified, jumlah review yang diberikan, dan kontribusi (%).
- Rumus kontribusi (%): total bobot milestone Verified milik anggota dibagi total bobot semua milestone Verified di proyek. Bobot default 1 per milestone. Dihitung lewat query SQL (view atau fungsi database).
- Linimasa aktivitas (unggah, review, revisi).
- Catatan di ringkasan: "Ringkasan ini mencatat aktivitas, bukan nilai."
- **Kriteria penerimaan:** angka pada ringkasan konsisten dengan data milestone dan review; milestone yang belum Verified tidak dihitung sebagai kontribusi.

### FR-7 Pengingat (Should)

- Pengingat dalam aplikasi sebelum tenggat milestone (misalnya H-2 dan H-0) dan saat milestone terlambat.
- **Kriteria penerimaan:** penanggung jawab melihat pengingat pada hari yang ditentukan.

### FR-8 Flag teks tanpa edit (Should)

- Aturan sederhana (lihat Lampiran A) menghasilkan notifikasi netral kepada reviewer.
- Flag tidak mengubah status dan tidak otomatis menolak apa pun.
- **Kriteria penerimaan:** teks flag bernada netral ("Perlu dicek lebih teliti"), bukan tuduhan; reviewer tetap harus memilih Verify atau Request Revision.

### FR-9 Ekspor PDF (Should)

- Unduh ringkasan kontribusi sebagai PDF dengan nama proyek, tanggal, dan tabel kontribusi.

### FR-10 Bobot milestone (Could)

- Leader menetapkan bobot 1 sampai 3 per milestone; dipakai dalam rumus FR-6.

## 6. Persyaratan Non-Fungsional

| Aspek | Persyaratan |
| --- | --- |
| Platform | Aplikasi web responsif (desktop dan browser ponsel) |
| Bahasa antarmuka | Inggris (selaras syarat kompetisi) |
| Kinerja | Halaman utama termuat dalam waktu wajar pada koneksi kampus; unggah file 10 MB dapat diselesaikan tanpa error |
| Keamanan | Row Level Security (RLS) aktif di semua tabel dan policy Storage membatasi data proyek hanya untuk anggota tim; service role key tidak pernah dipakai di klien dan tidak masuk repositori; hanya anon key dan URL proyek yang dipakai di frontend |
| Privasi | Kumpulkan hanya nama, email, dan file yang diunggah; tampilkan pemberitahuan persetujuan sebelum unggahan pertama; data proyek dapat dihapus atas permintaan |
| Aksesibilitas | Kontras warna memadai, label form jelas, dapat dioperasikan dengan keyboard |
| Data demo | Hanya data fiktif; tidak ada data mahasiswa nyata di demo |
| Keterlacakan | Riwayat versi dan review tidak dapat dihapus oleh penanggung jawab (tidak ada policy DELETE dan UPDATE untuk tabel submissions dan reviews bagi pengguna biasa) |

## 7. Alur Pengguna dan Status Milestone

### 7.1 Alur utama

1. Leader membuat proyek dan milestone.
2. Penanggung jawab mengunggah bukti kerja.
3. Teman satu tim mereview: Verify atau Request Revision.
4. Setelah milestone Verified, kontribusi masuk ke ringkasan.
5. Tim membuka ringkasan dan melampirkannya saat mengumpulkan tugas.

### 7.2 Status milestone

| Dari | Ke | Pemicu |
| --- | --- | --- |
| To Do | Submitted | Penanggung jawab mengunggah bukti kerja |
| Submitted | Verified | Anggota lain memilih Verify (dengan komentar) |
| Submitted | Revision requested | Anggota lain memilih Request Revision (dengan komentar) |
| Revision requested | Submitted | Penanggung jawab mengunggah versi baru |

"Overdue" adalah label (bukan status) pada milestone To Do, Submitted, atau Revision requested yang melewati tenggat.

### 7.3 Layar (selaras dengan prototype Stitch)

| No | Layar | Fungsi |
| --- | --- | --- |
| 1 | Create Project | FR-2, FR-3 |
| 2 | Milestone Board | FR-3 |
| 3 | Upload Proof of Work | FR-4 |
| 4 | Peer Review | FR-5, FR-8 |
| 5 | Contribution Summary | FR-6, FR-9 |

## 8. Definisi MVP

### 8.1 Prinsip

MVP adalah versi terkecil yang membuktikan satu hal: **kontribusi individu dapat dicatat, diverifikasi teman, dan dirangkum**. Semua yang tidak mendukung alur itu ditunda.

### 8.2 Cakupan MVP

| Lapisan | Fitur | Keterangan |
| --- | --- | --- |
| **Must (inti MVP)** | FR-1 sampai FR-6 | Tanpa ini demo tidak berjalan |
| **Should (jika waktu cukup)** | FR-7, FR-8, FR-9 | Dikerjakan setelah alur inti stabil; dipangkas dari yang terakhir |
| **Could (ditunda)** | FR-10 | Setelah Final Day |
| **Di luar MVP** | Akun dosen, integrasi LMS, mobile native, deteksi AI, multi-kampus | Lihat non-tujuan |

### 8.3 Garis pemotongan

Jika waktu mepet, pangkas dalam urutan ini: FR-9 (PDF), FR-8 (flag), FR-7 (pengingat). Ringkasan kontribusi (FR-6) boleh tampil di layar tanpa PDF.

### 8.4 Skenario demo Final Day

1. Masuk sebagai Leader (akun demo), buat proyek "Software Engineering Final Report" dengan 4 anggota fiktif dan 4 milestone.
2. Masuk sebagai Member A, buka milestone yang ditugaskan dan unggah file contoh beserta deskripsi.
3. Masuk sebagai Member B, review submission tersebut dan pilih Verify dengan komentar. (Jika FR-8 selesai: tampilkan flag pada submission lain.)
4. Buka Contribution Summary dan tunjukkan angka per anggota.
5. (Jika FR-9 selesai) unduh PDF.

### 8.5 Definition of Done MVP

- Skenario demo berjalan end to end pada URL yang dapat diakses juri.
- Semua kriteria penerimaan FR-1 sampai FR-6 terpenuhi.
- RLS policy dan policy Storage Supabase diuji: pengguna di luar tim tidak bisa membaca data proyek maupun file, dan penanggung jawab tidak bisa memverifikasi pekerjaannya sendiri.
- Proyek Supabase dipastikan aktif (tidak dalam kondisi dijeda) sebelum demo dan penilaian juri.
- Repositori, instruksi setup (termasuk skema SQL dan migrasi), dan akun demo siap.
- README mencantumkan sumber pihak ketiga, bantuan AI yang material, keterbatasan, dan bagian yang masih simulasi atau belum selesai.

## 9. Model Data

Database: PostgreSQL (Supabase). Semua tabel memakai RLS. ID pengguna mengacu ke `auth.users`.

| Tabel | Kolom utama | Relasi |
| --- | --- | --- |
| profiles | id (= auth.users.id), nama, email | 1 baris per pengguna |
| projects | id, judul, mata_kuliah, tenggat, leader_id | leader_id mengacu ke profiles |
| project_members | project_id, user_id, role (leader atau member) | PK gabungan (project_id, user_id); menggantikan memberIds |
| milestones | id, project_id, judul, tenggat, assignee_id, status, bobot (default 1) | project_id mengacu ke projects; assignee_id mengacu ke profiles |
| submissions | id, milestone_id, member_id, versi, deskripsi, file_paths, created_at | milestone_id mengacu ke milestones; file_paths merujuk ke objek di Storage |
| reviews | id, submission_id, reviewer_id, keputusan (verify atau revision), komentar, created_at | submission_id mengacu ke submissions |
| activity | id, project_id, tipe (upload, review, reminder), aktor_id, created_at | project_id mengacu ke projects |

Catatan desain:

- `status` pada milestones memakai enum: `todo`, `submitted`, `verified`, `revision_requested`.
- Constraint: `reviews.reviewer_id` tidak boleh sama dengan pemilik submission (cek lewat policy atau trigger).
- Ringkasan kontribusi (FR-6) dibuat sebagai view atau fungsi SQL yang menjumlahkan `bobot` milestone `verified` per `assignee_id`, dibagi total bobot milestone `verified` di proyek.
- Perubahan status yang bergantung pada beberapa tabel (unggah menjadi `submitted`, review menjadi `verified` atau `revision_requested`) dibuat atomik lewat fungsi database (RPC) atau trigger.

## 10. Arsitektur dan Teknologi

- **Frontend:** React dengan Next.js (responsif), memakai `@supabase/supabase-js` dengan anon key.
- **Backend:** Supabase sebagai backend utama. Operasi CRUD dan aturan akses lewat klien + RLS. API Node.js (opsional, hanya jika perlu) untuk logika yang lebih rumit: flag teks (FR-8), perhitungan ringkasan, dan ekspor PDF (FR-9). Jika dipakai, API ini memakai service role key di sisi server saja.
- **Supabase:** Auth (email/password dan Google), Postgres, Storage (bucket private), Realtime.
- **Data:** hanya dari input dan unggahan pengguna; tidak butuh layanan AI eksternal.

## 11. Rencana Rilis (selaras dengan proposal)

| Periode | Fokus | Hasil |
| --- | --- | --- |
| 1-6 Des | Repositori, proyek Next.js, proyek Supabase, autentikasi, skema SQL, draf RLS policy dan policy Storage | Kerangka proyek dengan sign-in |
| 7-10 Des | FR-2 dan FR-3 | Buat proyek dan papan milestone berjalan |
| 10-13 Des | FR-4 dan FR-5, lalu FR-7 | Alur inti end to end |
| 13-15 Des | FR-6, lalu FR-8 dan FR-9 jika waktu cukup; uji kegunaan; perbaikan | Prototype fitur lengkap |
| 15-16 Des | README, akun demo, keterbatasan, deck | Pengumpulan dan presentasi Final Day |

Rencana 7-16 Des bergantung pada pengumuman Top 10 (7 Des).

## 12. Risiko dan Asumsi

| Risiko / Asumsi | Dampak | Mitigasi |
| --- | --- | --- |
| Waktu pengembangan hanya sekitar 10 hari | Fitur tidak selesai | Garis pemotongan di 8.3; kerjakan Must dulu |
| Proyek Supabase free tier dapat dijeda otomatis jika tidak aktif. **Perlu dicek di dashboard.** | Demo atau penilaian juri gagal karena backend mati | Pastikan proyek aktif beberapa hari sebelum Final Day dan buka sehari sebelum demo; siapkan backup data demo |
| RLS policy salah tulis | Data proyek bocor ke pengguna lain, atau fitur terblokir | Tulis policy sejak awal; uji dengan akun dari tim lain; jangan matikan RLS untuk "mempercepat" |
| Batas ukuran file dan kuota Storage free tier | Unggah 10 MB gagal atau penuh | Cek batas di dashboard lebih awal; batasi ukuran file 10 MB di klien dan bucket |
| Tim baru belajar Supabase dan RLS | Kemajuan melambat | Putuskan sekarang dan tetap pakai; mulai dari policy sederhana berbasis keanggotaan proyek |
| Flag dianggap tuduhan atau salah deteksi | Pengguna tersinggung, kepercayaan turun | Teks netral; flag tidak mengubah status |
| Teman saling verifikasi tanpa memeriksa | Verifikasi tidak bermakna | Komentar wajib; riwayat review terlihat di ringkasan |
| Anggota tidak mau unggah bukti | Ringkasan tidak lengkap | Pengingat dan celah yang terlihat di ringkasan |
| Dosen tidak mengakui ringkasan | Nilai produk berkurang | Ringkasan tetap berguna bagi tim; fokus satu mata kuliah |
| Asumsi: 1 verifikasi cukup untuk status Verified | Bisa terlalu longgar | Dapat dinaikkan menjadi 2 pada tim 5 orang setelah uji |

## 13. Pertanyaan Terbuka

1. Siapa yang boleh mereview: semua anggota lain, atau reviewer yang ditunjuk Leader?
2. Apakah Leader boleh menghapus milestone yang sudah punya submission?
3. Apakah ringkasan perlu tanda tangan atau konfirmasi seluruh anggota sebelum diunduh?
4. Cara masuk: email dan password saja, atau juga Google sign-in? (Google sign-in butuh konfigurasi OAuth di Google Cloud dan Supabase.)
5. Apakah logika flag dan ekspor PDF dijalankan di API Node.js terpisah, atau cukup di Supabase (fungsi database atau Edge Function)?

## Lampiran A. Aturan Flag Teks (FR-8)

Aturan dihitung pada teks submission dibandingkan dengan versi sebelumnya milik anggota yang sama.

| Aturan | Kondisi | Hasil |
| --- | --- | --- |
| A1 | Sebagian besar teks muncul pada satu versi tanpa draf sebelumnya | Flag "Perlu dicek lebih teliti" |
| A2 | Teks tidak berubah setelah reviewer meminta revisi | Flag "Perlu dicek lebih teliti" |

Batas persentase untuk "sebagian besar" ditentukan saat implementasi dan diuji pada data contoh. Keterbatasan: aturan ini tidak dapat memastikan teks ditulis oleh AI dan dapat menghasilkan false positive. Setiap flag memerlukan keputusan manusia.

## Lampiran B. Contoh RLS Policy (sketsa awal)

Sketsa ini untuk memandu implementasi, bukan skema final. Sesuaikan nama tabel dan kolom saat migrasi dibuat.

```sql
-- Aktifkan RLS
alter table projects enable row level security;
alter table project_members enable row level security;
alter table milestones enable row level security;
alter table submissions enable row level security;
alter table reviews enable row level security;

-- Fungsi bantu: apakah pengguna anggota proyek?
create function is_project_member(pid uuid) returns boolean
language sql security definer set search_path = public as $$
  select exists (
    select 1 from project_members
    where project_id = pid and user_id = auth.uid()
  );
$$;

-- Anggota hanya melihat proyek yang diikuti
create policy "members read projects" on projects
  for select using (is_project_member(id));

-- Anggota melihat milestone proyeknya
create policy "members read milestones" on milestones
  for select using (is_project_member(project_id));

-- Review: harus anggota proyek dan bukan pemilik submission
create policy "members review others" on reviews
  for insert with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from submissions s
      join milestones m on m.id = s.milestone_id
      where s.id = submission_id
        and s.member_id <> auth.uid()
        and is_project_member(m.project_id)
    )
  );

-- Tidak ada policy UPDATE atau DELETE untuk submissions dan reviews
-- sehingga riwayat tidak dapat diubah atau dihapus pengguna biasa.
```
