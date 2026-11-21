/**
 * Seed Script untuk FairWork Platform
 * Mengisi akun dummy (Auth) dan data Firestore demo (FIKTIF).
 *
 * Dapat dijalankan pada Firebase Local Emulator maupun Cloud Firebase Project.
 * Penggunaan:
 *   node src/scripts/seed.js            (Otomatis deteksi env atau emulator)
 *   npm run seed
 */
import dotenv from 'dotenv';
dotenv.config();

// Jika dijalankan lokal tanpa service account, defaultkan ke emulator port jika belum diset
if (!process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
  console.log('ℹ️ Mengarahkan seed script ke Firebase Local Emulator (127.0.0.1)');
}

import { adminAuth, adminDb } from '../server/firebaseAdmin.js';

// 1. Data Pengguna Fiktif (1 Leader + 4 Member)
const DEMO_USERS = [
  {
    uid: 'user_leader_budi',
    email: 'budi.santoso@contoh-kampus.ac.id',
    nama: 'Budi Santoso',
    password: 'Password123!',
    role: 'Leader',
  },
  {
    uid: 'user_member_siti',
    email: 'siti.rahmah@contoh-kampus.ac.id',
    nama: 'Siti Rahmah',
    password: 'Password123!',
    role: 'Member',
  },
  {
    uid: 'user_member_andi',
    email: 'andi.pratama@contoh-kampus.ac.id',
    nama: 'Andi Pratama',
    password: 'Password123!',
    role: 'Member',
  },
  {
    uid: 'user_member_dewi',
    email: 'dewi.lestari@contoh-kampus.ac.id',
    nama: 'Dewi Lestari',
    password: 'Password123!',
    role: 'Member',
  },
  {
    uid: 'user_member_rizky',
    email: 'rizky.fauzi@contoh-kampus.ac.id',
    nama: 'Rizky Fauzi',
    password: 'Password123!',
    role: 'Member',
  },
];

// 2. Data Proyek Fiktif
const PROJECT_ID = 'project_se_final_report';
const PROJECT_DATA = {
  id: PROJECT_ID,
  judul: 'Software Engineering Final Report',
  mataKuliah: 'Rekayasa Perangkat Lunak (IF-301)',
  tenggat: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 hari lagi
  leaderId: 'user_leader_budi',
  memberIds: DEMO_USERS.map((u) => u.uid),
  createdAt: new Date().toISOString(),
};

// 3. Data Milestones (4 Milestone dengan variasi status)
const MILESTONES_DATA = [
  {
    id: 'ms_01_srs',
    projectId: PROJECT_ID,
    judul: 'Bab 1 - Software Requirements Specification (SRS)',
    tenggat: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    assigneeId: 'user_member_siti',
    status: 'verified', // sudah diverifikasi rekan tim
    bobot: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ms_02_architecture',
    projectId: PROJECT_ID,
    judul: 'Bab 2 - Desain Arsitektur & Database Schema',
    tenggat: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assigneeId: 'user_member_andi',
    status: 'submitted', // menunggu verifikasi
    bobot: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ms_03_implementation',
    projectId: PROJECT_ID,
    judul: 'Bab 3 - Implementasi Backend API & Aturan Bisnis',
    tenggat: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    assigneeId: 'user_member_dewi',
    status: 'revision_requested', // diminta revisi
    bobot: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ms_04_testing_deployment',
    projectId: PROJECT_ID,
    judul: 'Bab 4 - Pengujian Sistem (E2E) & Laporan Akhir',
    tenggat: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    assigneeId: 'user_member_rizky',
    status: 'todo', // belum dikerjakan
    bobot: 1,
    createdAt: new Date().toISOString(),
  },
];

// 4. Data Submissions
const SUBMISSIONS_DATA = [
  {
    id: 'sub_01_srs_v1',
    projectId: PROJECT_ID,
    milestoneId: 'ms_01_srs',
    memberId: 'user_member_siti',
    versi: 1,
    deskripsi: 'Dokumen SRS versi 1.0 lengkap dengan skenario use case dan diagram konteks.',
    fileRefs: [`projects/${PROJECT_ID}/milestones/ms_01_srs/srs_v1.0.pdf`],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub_02_arch_v1',
    projectId: PROJECT_ID,
    milestoneId: 'ms_02_architecture',
    memberId: 'user_member_andi',
    versi: 1,
    deskripsi: 'Diagram arsitektur sistem dan Entity Relationship Diagram (ERD) Firestore.',
    fileRefs: [`projects/${PROJECT_ID}/milestones/ms_02_architecture/arsitektur_erd.png`],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub_03_impl_v1',
    projectId: PROJECT_ID,
    milestoneId: 'ms_03_implementation',
    memberId: 'user_member_dewi',
    versi: 1,
    deskripsi: 'Draft implementasi Express middleware dan aturan keamanan Firestore.',
    fileRefs: [`projects/${PROJECT_ID}/milestones/ms_03_implementation/backend_impl.docx`],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// 5. Data Reviews
const REVIEWS_DATA = [
  {
    id: 'rev_01_srs_ok',
    projectId: PROJECT_ID,
    submissionId: 'sub_01_srs_v1',
    reviewerId: 'user_leader_budi',
    keputusan: 'verify',
    komentar: 'SRS sudah sangat detail, diagram alur jelas dan spesifikasi fungsional telah lengkap.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev_02_impl_revision',
    projectId: PROJECT_ID,
    submissionId: 'sub_03_impl_v1',
    reviewerId: 'user_member_andi',
    keputusan: 'revision',
    komentar: 'Harap lengkapi diagram sequence dan unit test rules sebelum di-merge ke branch utama.',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

// 6. Data Activity Logs
const ACTIVITY_DATA = [
  {
    id: 'act_01_project_created',
    projectId: PROJECT_ID,
    tipe: 'reminder',
    aktorId: 'user_leader_budi',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act_02_srs_uploaded',
    projectId: PROJECT_ID,
    tipe: 'upload',
    aktorId: 'user_member_siti',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act_03_srs_verified',
    projectId: PROJECT_ID,
    tipe: 'review',
    aktorId: 'user_leader_budi',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act_04_arch_uploaded',
    projectId: PROJECT_ID,
    tipe: 'upload',
    aktorId: 'user_member_andi',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act_05_impl_revision',
    projectId: PROJECT_ID,
    tipe: 'review',
    aktorId: 'user_member_andi',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

async function seed() {
  console.log('🌱 [Seed Script] Memulai seeding data fiktif FairWork...\n');

  // A. Seed Firebase Auth Users & users collection
  console.log('👤 Mengisi akun Firebase Authentication dan koleksi `users`:');
  for (const user of DEMO_USERS) {
    try {
      try {
        await adminAuth.getUser(user.uid);
        await adminAuth.updateUser(user.uid, {
          email: user.email,
          displayName: user.nama,
          password: user.password,
        });
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          await adminAuth.createUser({
            uid: user.uid,
            email: user.email,
            displayName: user.nama,
            password: user.password,
            emailVerified: true,
          });
        } else {
          throw authError;
        }
      }

      await adminDb.collection('users').doc(user.uid).set({
        uid: user.uid,
        nama: user.nama,
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      console.log(`   ✓ ${user.nama} (${user.email}) [UID: ${user.uid}]`);
    } catch (err) {
      console.error(`   ✗ Gagal membuat user ${user.nama}:`, err.message);
    }
  }

  // B. Seed Projects
  console.log('\n📁 Mengisi koleksi `projects`:');
  await adminDb.collection('projects').doc(PROJECT_ID).set(PROJECT_DATA);
  console.log(`   ✓ Proyek "${PROJECT_DATA.judul}" [ID: ${PROJECT_ID}]`);

  // C. Seed Milestones
  console.log('\n🎯 Mengisi koleksi `milestones`:');
  for (const ms of MILESTONES_DATA) {
    await adminDb.collection('milestones').doc(ms.id).set(ms);
    console.log(`   ✓ Milestone: ${ms.judul} (Status: ${ms.status}, Assignee: ${ms.assigneeId})`);
  }

  // D. Seed Submissions
  console.log('\n📄 Mengisi koleksi `submissions`:');
  for (const sub of SUBMISSIONS_DATA) {
    await adminDb.collection('submissions').doc(sub.id).set(sub);
    console.log(`   ✓ Submission: ${sub.id} (Milestone: ${sub.milestoneId}, Versi: ${sub.versi})`);
  }

  // E. Seed Reviews
  console.log('\n📝 Mengisi koleksi `reviews`:');
  for (const rev of REVIEWS_DATA) {
    await adminDb.collection('reviews').doc(rev.id).set(rev);
    console.log(`   ✓ Review: ${rev.id} (Submission: ${rev.submissionId}, Keputusan: ${rev.keputusan})`);
  }

  // F. Seed Activity Logs
  console.log('\n⏱️ Mengisi koleksi `activity`:');
  for (const act of ACTIVITY_DATA) {
    await adminDb.collection('activity').doc(act.id).set(act);
    console.log(`   ✓ Log Aktivitas: ${act.tipe} oleh ${act.aktorId}`);
  }

  console.log('\n✨ [Seed Script] Selesai! Semua data fiktif siap digunakan.');
}

seed()
  .catch((err) => {
    console.error('❌ Terjadi kesalahan saat seed:', err);
    process.exit(1);
  });
