function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  res.status(statusCode).json({
    ok: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
}

module.exports = errorHandler;
