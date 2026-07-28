const crypto = require('crypto');

const ADMIN_USER = 'nino';
const ADMIN_PASSWORD = 'elbuensabor123';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;

const activeTokens = new Map();

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of activeTokens.entries()) {
    if (data.expiresAt <= now) {
      activeTokens.delete(token);
    }
  }
}

function login(username, password) {
  cleanupExpiredTokens();

  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return null;
  }

  const token = crypto.randomUUID();
  activeTokens.set(token, {
    username,
    expiresAt: Date.now() + TOKEN_TTL_MS
  });

  return {
    token,
    username,
    expiresInMs: TOKEN_TTL_MS
  };
}

function verifyToken(token) {
  cleanupExpiredTokens();

  if (!token) return null;
  const tokenData = activeTokens.get(token);
  if (!tokenData) return null;

  if (tokenData.expiresAt <= Date.now()) {
    activeTokens.delete(token);
    return null;
  }

  return tokenData;
}

module.exports = {
  login,
  verifyToken
};
