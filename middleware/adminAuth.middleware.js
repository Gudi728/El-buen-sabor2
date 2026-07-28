const adminAuthService = require('../services/adminAuth.service');

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  const session = adminAuthService.verifyToken(token);
  if (!session) {
    return res.status(401).json({
      ok: false,
      message: 'No autorizado'
    });
  }

  req.adminSession = session;
  return next();
}

module.exports = adminAuthMiddleware;
