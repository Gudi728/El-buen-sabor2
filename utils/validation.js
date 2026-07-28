function sanitizeText(value, maxLength = 300) {
  return String(value || '').trim().slice(0, maxLength);
}

function ensureNonEmptyString(value, fieldName, maxLength = 300) {
  const text = sanitizeText(value, maxLength);
  if (!text) {
    throw new Error(`${fieldName} es obligatorio`);
  }
  return text;
}

function ensureOptionalUrl(value, fieldName) {
  const text = sanitizeText(value, 500);
  if (!text) return '';

  let parsed;
  try {
    parsed = new URL(text);
  } catch (error) {
    throw new Error(`${fieldName} invalida`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${fieldName} invalida`);
  }

  return text;
}

function ensureNonNegativeNumber(value, fieldName) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} debe ser mayor o igual a 0`);
  }
  return number;
}

function ensurePhone(value, fieldName) {
  const text = sanitizeText(value, 30);
  if (!/^[0-9+\-\s]{8,20}$/.test(text)) {
    throw new Error(`${fieldName} invalido`);
  }
  return text;
}

module.exports = {
  sanitizeText,
  ensureNonEmptyString,
  ensureOptionalUrl,
  ensureNonNegativeNumber,
  ensurePhone
};
