const crypto = require('crypto');
const { getStorage } = require('../config/firebase');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_FOLDERS = new Set(['categorias', 'productos', 'general']);

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;

  return {
    mimeType: match[1],
    data: Buffer.from(match[2], 'base64')
  };
}

function getExtensionFromMime(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return 'bin';
}

async function uploadImageFromDataUrl({ dataUrl, folder }) {
  const bucket = getStorage();

  if (!bucket) {
    throw new Error('Firebase Storage no configurado');
  }

  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    throw new Error('Formato de imagen invalido');
  }

  if (!ALLOWED_MIME_TYPES.has(parsed.mimeType)) {
    throw new Error('Solo se permiten archivos de imagen');
  }

  if (parsed.data.length > MAX_IMAGE_BYTES) {
    throw new Error('La imagen supera el tamano maximo de 5MB');
  }

  const ext = getExtensionFromMime(parsed.mimeType);
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const requestedFolder = String(folder || 'general').replace(/[^a-z0-9-_]/gi, '');
  const safeFolder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : 'general';
  const path = `${safeFolder}/${fileName}`;
  const file = bucket.file(path);
  const downloadToken = crypto.randomUUID();

  await file.save(parsed.data, {
    metadata: {
      contentType: parsed.mimeType,
      metadata: {
        firebaseStorageDownloadTokens: downloadToken
      }
    },
    resumable: false
  });

  return {
    path,
    url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`
  };
}

module.exports = {
  uploadImageFromDataUrl
};
