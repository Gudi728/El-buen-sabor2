function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    message: 'Recurso no encontrado'
  });
}

module.exports = notFoundHandler;
