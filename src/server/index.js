/**
 * FairWork Express API Server
 * Menyediakan endpoint backend dengan proteksi Firebase ID Token middleware
 */
import express from 'express';
import dotenv from 'dotenv';
import { verifyAuth } from './middleware/authMiddleware.js';
import { adminDb } from './firebaseAdmin.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Health check endpoint (Public)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'fairwork-api', timestamp: new Date().toISOString() });
});

// Protected route demo: Get User Profile & Registered Projects
app.get('/api/me', verifyAuth, async (req, res) => {
  try {
    const userDoc = await adminDb.collection('users').doc(req.user.uid).get();
    res.json({
      success: true,
      user: {
        ...req.user,
        profile: userDoc.exists ? userDoc.data() : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected route: Endpoint bisnis untuk review submission
// Aturan bisnis: Penanggung jawab tidak boleh memverifikasi pekerjaannya sendiri, komentar wajib.
app.post('/api/submissions/:submissionId/review', verifyAuth, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { keputusan, komentar } = req.body; // keputusan: 'verify' | 'revision'
    const reviewerId = req.user.uid;

    if (!komentar || komentar.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Validation error: Komentar wajib diisi pada verifikasi maupun permintaan revisi.',
      });
    }

    if (!['verify', 'revision'].includes(keputusan)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error: Keputusan harus "verify" atau "revision".',
      });
    }

    const subDoc = await adminDb.collection('submissions').doc(submissionId).get();
    if (!subDoc.exists) {
      return res.status(404).json({ success: false, error: 'Submission tidak ditemukan.' });
    }

    const submissionData = subDoc.data();

    // Aturan bisnis: Penanggung jawab milestone tidak boleh mereview pekerjaannya sendiri!
    if (submissionData.memberId === reviewerId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Penanggung jawab submission dilarang mereview pekerjaannya sendiri.',
      });
    }

    // Aturan bisnis: Harus merupakan anggota proyek terkait
    const projectDoc = await adminDb.collection('projects').doc(submissionData.projectId).get();
    if (!projectDoc.exists || !projectDoc.data().memberIds.includes(reviewerId)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Anda bukan anggota dari proyek ini.',
      });
    }

    // Simpan review baru ke Firestore melalui Admin SDK
    const reviewRef = adminDb.collection('reviews').doc();
    const newStatus = keputusan === 'verify' ? 'verified' : 'revision_requested';

    const batch = adminDb.batch();

    batch.set(reviewRef, {
      id: reviewRef.id,
      projectId: submissionData.projectId,
      submissionId,
      reviewerId,
      keputusan,
      komentar: komentar.trim(),
      createdAt: new Date().toISOString(),
    });

    // Update status milestone terkait
    const milestoneRef = adminDb.collection('milestones').doc(submissionData.milestoneId);
    batch.update(milestoneRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    // Catat activity log
    const activityRef = adminDb.collection('activity').doc();
    batch.set(activityRef, {
      id: activityRef.id,
      projectId: submissionData.projectId,
      tipe: 'review',
      aktorId: reviewerId,
      detail: `Reviewer memberikan ${keputusan} pada milestone ${submissionData.milestoneId}`,
      createdAt: new Date().toISOString(),
    });

    await batch.commit();

    return res.json({
      success: true,
      message: `Review berhasil dicatat. Status milestone kini "${newStatus}".`,
      reviewId: reviewRef.id,
    });
  } catch (error) {
    console.error('Error saat memproses review:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Jalankan server jika dipanggil langsung
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 [FairWork API] Server aktif di http://localhost:${port}`);
  });
}

export default app;
