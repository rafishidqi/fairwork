/**
 * Unit Test untuk Security Rules Firestore dan Cloud Storage
 * Menggunakan @firebase/rules-unit-testing dan runner built-in node:test
 *
 * Menguji:
 * (a) Anggota bisa membaca proyeknya
 * (b) Non-anggota ditolak membaca projects, milestones, dan file Storage
 * (c) Klien ditolak menulis langsung ke reviews dan submissions (harus via Admin SDK)
 * (d) Upload file di atas 10 MB atau tipe file yang tidak diizinkan ditolak
 */

import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, before, after, beforeEach } from 'node:test';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, getBytes, uploadBytes, deleteObject, updateMetadata } from 'firebase/storage';

const PROJECT_ID = 'fairwork-rules-test';
const FIRESTORE_RULES_PATH = resolve(process.cwd(), 'firestore.rules');
const STORAGE_RULES_PATH = resolve(process.cwd(), 'storage.rules');

let testEnv;

describe('FairWork Firebase Security Rules Tests', () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: readFileSync(FIRESTORE_RULES_PATH, 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
      storage: {
        rules: readFileSync(STORAGE_RULES_PATH, 'utf8'),
        host: '127.0.0.1',
        port: 9199,
      },
    });
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.clearStorage();

    // Setup base data menggunakan hak akses Admin (Security Rules bypass)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();

      // Proyek demo dengan anggota: 'user_member_1' dan 'user_member_2'
      await setDoc(doc(adminDb, 'projects', 'proj-alpha'), {
        id: 'proj-alpha',
        judul: 'Proyek RPL Demo',
        mataKuliah: 'Rekayasa Perangkat Lunak',
        leaderId: 'user_member_1',
        memberIds: ['user_member_1', 'user_member_2'],
      });

      // Milestone milik proj-alpha
      await setDoc(doc(adminDb, 'milestones', 'ms-01'), {
        id: 'ms-01',
        projectId: 'proj-alpha',
        judul: 'Bab 1 SRS',
        status: 'submitted',
        assigneeId: 'user_member_2',
      });

      // Submission milik ms-01
      await setDoc(doc(adminDb, 'submissions', 'sub-01'), {
        id: 'sub-01',
        projectId: 'proj-alpha',
        milestoneId: 'ms-01',
        memberId: 'user_member_2',
        versi: 1,
        deskripsi: 'Draft SRS v1',
      });
    });
  });

  // =========================================================================
  // KASUS (a): Anggota bisa membaca proyeknya
  // =========================================================================
  describe('Kasus (a): Akses Anggota Proyek', () => {
    it('Anggota (user_member_1) diizinkan membaca dokumen proyeknya', async () => {
      const memberDb = testEnv.authenticatedContext('user_member_1').firestore();
      const projectRef = doc(memberDb, 'projects', 'proj-alpha');

      await assertSucceeds(getDoc(projectRef));
    });

    it('Anggota (user_member_2) diizinkan membaca milestone dalam proyeknya', async () => {
      const memberDb = testEnv.authenticatedContext('user_member_2').firestore();
      const milestoneRef = doc(memberDb, 'milestones', 'ms-01');

      await assertSucceeds(getDoc(milestoneRef));
    });
  });

  // =========================================================================
  // KASUS (b): Non-anggota ditolak membaca projects, milestones, dan Storage
  // =========================================================================
  describe('Kasus (b): Penolakan Akses Non-Anggota', () => {
    it('Non-anggota (user_outsider) ditolak membaca dokumen proyek', async () => {
      const outsiderDb = testEnv.authenticatedContext('user_outsider').firestore();
      const projectRef = doc(outsiderDb, 'projects', 'proj-alpha');

      await assertFails(getDoc(projectRef));
    });

    it('Pengguna unauthenticated (tamu) ditolak membaca dokumen proyek', async () => {
      const guestDb = testEnv.unauthenticatedContext().firestore();
      const projectRef = doc(guestDb, 'projects', 'proj-alpha');

      await assertFails(getDoc(projectRef));
    });

    it('Non-anggota (user_outsider) ditolak membaca milestone proyek orang lain', async () => {
      const outsiderDb = testEnv.authenticatedContext('user_outsider').firestore();
      const milestoneRef = doc(outsiderDb, 'milestones', 'ms-01');

      await assertFails(getDoc(milestoneRef));
    });

    it('Non-anggota (user_outsider) ditolak mengunduh file Storage proyek orang lain', async () => {
      // Simulasikan file ada di Storage terlebih dahulu
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const storage = context.storage();
        const dummyFileRef = ref(storage, 'projects/proj-alpha/milestones/ms-01/laporan.pdf');
        await uploadBytes(dummyFileRef, Buffer.from('%PDF-1.4 test content'), {
          contentType: 'application/pdf',
        });
      });

      const outsiderStorage = testEnv.authenticatedContext('user_outsider').storage();
      const targetRef = ref(outsiderStorage, 'projects/proj-alpha/milestones/ms-01/laporan.pdf');

      await assertFails(getBytes(targetRef));
    });
  });

  // =========================================================================
  // KASUS (c): Klien ditolak menulis langsung ke reviews dan submissions
  // =========================================================================
  describe('Kasus (c): Immutability & Penolakan Write Klien (Wajib via Admin SDK)', () => {
    it('Klien (meskipun anggota proyek) ditolak membuat submission langsung ke Firestore', async () => {
      const memberDb = testEnv.authenticatedContext('user_member_1').firestore();
      const newSubRef = doc(memberDb, 'submissions', 'sub-illegal-client');

      await assertFails(
        setDoc(newSubRef, {
          id: 'sub-illegal-client',
          projectId: 'proj-alpha',
          milestoneId: 'ms-01',
          memberId: 'user_member_1',
          versi: 2,
          deskripsi: 'Bypass attempt directly from client',
        })
      );
    });

    it('Klien (meskipun anggota proyek) ditolak membuat review langsung ke Firestore', async () => {
      const memberDb = testEnv.authenticatedContext('user_member_1').firestore();
      const newReviewRef = doc(memberDb, 'reviews', 'rev-illegal-client');

      await assertFails(
        setDoc(newReviewRef, {
          id: 'rev-illegal-client',
          projectId: 'proj-alpha',
          submissionId: 'sub-01',
          reviewerId: 'user_member_1',
          keputusan: 'verify',
          komentar: 'Bypass review directly from client',
        })
      );
    });

    it('Klien ditolak mengupdate atau menghapus submission lama', async () => {
      const memberDb = testEnv.authenticatedContext('user_member_1').firestore();
      const existingSubRef = doc(memberDb, 'submissions', 'sub-01');

      await assertFails(
        setDoc(existingSubRef, { deskripsi: 'Tampered description' }, { merge: true })
      );
    });
  });

  // =========================================================================
  // KASUS (d): Validasi Upload Storage (Ukuran > 10 MB dan Tipe File)
  // =========================================================================
  describe('Kasus (d): Validasi Upload Cloud Storage', () => {
    it('Anggota diizinkan mengunggah file PDF berukuran valid (< 10 MB)', async () => {
      const memberStorage = testEnv.authenticatedContext('user_member_1').storage();
      const validRef = ref(memberStorage, 'projects/proj-alpha/milestones/ms-01/dokumen.pdf');
      const validPayload = Buffer.from('%PDF-1.4 dummy pdf payload');

      await assertSucceeds(
        uploadBytes(validRef, validPayload, {
          contentType: 'application/pdf',
        })
      );
    });

    it('Anggota diizinkan mengunggah file PNG berukuran valid', async () => {
      const memberStorage = testEnv.authenticatedContext('user_member_1').storage();
      const validRef = ref(memberStorage, 'projects/proj-alpha/milestones/ms-01/screenshot.png');
      const validPayload = Buffer.from('PNG_DUMMY_DATA');

      await assertSucceeds(
        uploadBytes(validRef, validPayload, {
          contentType: 'image/png',
        })
      );
    });

    it('Ditolak jika mengunggah tipe file yang tidak diizinkan (.exe / application/x-msdownload)', async () => {
      const memberStorage = testEnv.authenticatedContext('user_member_1').storage();
      const invalidTypeRef = ref(memberStorage, 'projects/proj-alpha/milestones/ms-01/virus.exe');
      const payload = Buffer.from('MZ_DUMMY_EXECUTABLE');

      await assertFails(
        uploadBytes(invalidTypeRef, payload, {
          contentType: 'application/x-msdownload',
        })
      );
    });

    it('Ditolak jika ukuran file melebihi batas 10 MB', async () => {
      const memberStorage = testEnv.authenticatedContext('user_member_1').storage();
      const hugeFileRef = ref(memberStorage, 'projects/proj-alpha/milestones/ms-01/huge.pdf');

      // Ukuran 10 MB + 1 Byte = 10485761 bytes
      const oversizedPayload = new Uint8Array(10 * 1024 * 1024 + 1);

      await assertFails(
        uploadBytes(hugeFileRef, oversizedPayload, {
          contentType: 'application/pdf',
        })
      );
    });

    it('Ditolak jika klien mencoba update metadata atau delete file Storage yang sudah ada', async () => {
      const memberStorage = testEnv.authenticatedContext('user_member_1').storage();
      const targetRef = ref(memberStorage, 'projects/proj-alpha/milestones/ms-01/locked.pdf');

      // Berhasil saat create pertama kali
      await assertSucceeds(
        uploadBytes(targetRef, Buffer.from('original content'), {
          contentType: 'application/pdf',
        })
      );

      // Ditolak saat mencoba update metadata (karena allow update: if false)
      await assertFails(
        updateMetadata(targetRef, {
          customMetadata: { tampered: 'true' },
        })
      );

      // Ditolak saat mencoba delete file (karena allow delete: if false)
      await assertFails(deleteObject(targetRef));
    });
  });

  // =========================================================================
  // KASUS Tambahan: Aturan Koleksi Users
  // =========================================================================
  describe('Koleksi Users: Kepemilikan Profil', () => {
    it('Pengguna hanya boleh membuat/mengubah dokumen miliknya sendiri', async () => {
      const userDb = testEnv.authenticatedContext('user_member_1').firestore();
      const ownProfileRef = doc(userDb, 'users', 'user_member_1');

      await assertSucceeds(
        setDoc(ownProfileRef, {
          uid: 'user_member_1',
          nama: 'Budi Leader',
          email: 'budi@contoh-kampus.ac.id',
        })
      );
    });

    it('Pengguna ditolak mengubah profil milik pengguna lain', async () => {
      const userDb = testEnv.authenticatedContext('user_member_1').firestore();
      const victimProfileRef = doc(userDb, 'users', 'user_member_2');

      await assertFails(
        setDoc(victimProfileRef, {
          nama: 'Hacked Name',
        })
      );
    });
  });
});
