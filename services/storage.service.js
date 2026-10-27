const { v2: cloudinary } = require('cloudinary');
const env = require('../config/env');

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

function configureCloudinary() {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary no configurado');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

async function uploadImageFromDataUrl({ dataUrl, folder }) {
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

  const requestedFolder = String(folder || 'general').replace(/[^a-z0-9-_]/gi, '');
  const safeFolder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : 'general';
  configureCloudinary();

  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: `el-buen-sabor/${safeFolder}`,
    resource_type: 'image'
  });

  return {
    path: result.public_id,
    url: result.secure_url
  };
}

module.exports = {
  uploadImageFromDataUrl
};
