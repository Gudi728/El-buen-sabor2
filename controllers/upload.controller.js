const storageService = require('../services/storage.service');
const { ensureNonEmptyString, sanitizeText } = require('../utils/validation');

async function uploadImage(req, res) {
  const dataUrl = ensureNonEmptyString(req.body?.dataUrl, 'Imagen', 6_000_000);
  const folder = sanitizeText(req.body?.folder, 30) || 'general';

  const result = await storageService.uploadImageFromDataUrl({
    dataUrl,
    folder
  });

  return res.status(201).json({
    ok: true,
    data: result
  });
}

module.exports = {
  uploadImage
};
