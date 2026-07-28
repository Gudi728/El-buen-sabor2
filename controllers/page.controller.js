const path = require('path');

const viewsPath = path.join(__dirname, '..', 'views');

function renderIndex(req, res) {
  res.sendFile(path.join(viewsPath, 'index.html'));
}

function renderCategoria(req, res) {
  res.sendFile(path.join(viewsPath, 'categoria.html'));
}

function renderCarrito(req, res) {
  res.sendFile(path.join(viewsPath, 'carrito.html'));
}

function renderAdmin(req, res) {
  res.sendFile(path.join(viewsPath, 'admin.html'));
}

module.exports = {
  renderIndex,
  renderCategoria,
  renderCarrito,
  renderAdmin
};
