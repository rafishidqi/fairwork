/**
 * Middleware Autentikasi Firebase ID Token untuk API Node.js (Express & Next.js kompatibel)
 * Memverifikasi header `Authorization: Bearer <token>` menggunakan Firebase Admin SDK (verifyIdToken)
 */
import { adminAuth } from '../firebaseAdmin.js';

/**
 * Express Middleware untuk proteksi endpoint API
 */
export async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Akses ditolak: Header Authorization dengan format "Bearer <token>" wajib disertakan.',
      });
    }

    const idToken = authHeader.split('Bearer ')[1]?.trim();
    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Akses ditolak: ID Token kosong.',
      });
    }

    // Verifikasi integritas dan masa berlaku token menggunakan Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Lampirkan data user ke object request untuk dipakai pada route berikutnya
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || '',
      emailVerified: decodedToken.email_verified || false,
      decodedToken,
    };

    return next();
  } catch (error) {
    console.error('❌ [Auth Middleware] Gagal verifikasi ID Token:', error.message);

    let clientMessage = 'Token autentikasi tidak valid atau sudah kedaluwarsa.';
    if (error.code === 'auth/id-token-expired') {
      clientMessage = 'Sesi telah kedaluwarsa, silakan refresh token atau login ulang.';
    } else if (error.code === 'auth/id-token-revoked') {
      clientMessage = 'Token telah dicabut, silakan login ulang.';
    }

    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: clientMessage,
      code: error.code || 'INVALID_TOKEN',
    });
  }
}

/**
 * Helper untuk Next.js App Router (Route Handlers) jika API ditaruh di app/api/...
 * @param {Request} request Next.js / Web Standard Request object
 * @returns {Promise<{ uid: string, email: string, decodedToken: any }>}
 */
export async function verifyNextRequest(request) {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Header Authorization dengan format "Bearer <token>" wajib disertakan.');
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  if (!idToken) {
    throw new Error('ID Token kosong.');
  }

  return await adminAuth.verifyIdToken(idToken);
}

export default verifyAuth;
