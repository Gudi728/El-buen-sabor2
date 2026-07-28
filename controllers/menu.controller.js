const menuService = require('../services/menu.service');

async function getCategories(req, res) {
  const categories = await menuService.getPublicCategories();
  res.status(200).json({ ok: true, data: categories });
}

async function getCategoryWithProducts(req, res) {
  const { slug } = req.params;
  const category = await menuService.getPublicCategoryBySlug(slug);

  if (!category) {
    return res.status(404).json({
      ok: false,
      message: 'Categoria no encontrada'
    });
  }

  const products = await menuService.getPublicProductsByCategorySlug(slug);

  return res.status(200).json({
    ok: true,
    data: {
      category,
      products
    }
  });
}

async function getProductsByCategory(req, res) {
  const { slug } = req.params;
  const category = await menuService.getPublicCategoryBySlug(slug);

  if (!category) {
    return res.status(404).json({
      ok: false,
      message: 'Categoria no encontrada'
    });
  }

  const products = await menuService.getPublicProductsByCategorySlug(slug);
  return res.status(200).json({ ok: true, data: products });
}

async function getProducts(req, res) {
  const data = await menuService.getPublicProducts({
    search: req.query.search,
    categorySlug: req.query.categoria,
    featuredOnly: req.query.destacados === '1',
    topSellingOnly: req.query.masVendidos === '1',
    limit: req.query.limit
  });

  return res.status(200).json({ ok: true, data });
}

async function getFeaturedProducts(req, res) {
  const data = await menuService.getPublicProducts({
    featuredOnly: true,
    limit: req.query.limit || 8
  });

  return res.status(200).json({ ok: true, data });
}

async function getTopSellingProducts(req, res) {
  const data = await menuService.getPublicProducts({
    topSellingOnly: true,
    limit: req.query.limit || 8
  });

  return res.status(200).json({ ok: true, data });
}

async function getDeliverySettings(req, res) {
  const settings = await menuService.getPublicDeliverySettings();
  return res.status(200).json({ ok: true, data: settings });
}

async function getStoreStatus(req, res) {
  const status = await menuService.getPublicStoreStatus();
  return res.status(200).json({ ok: true, data: status });
}

async function streamProducts(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const unsubscribe = await menuService.subscribePublicProducts((snapshot) => {
    res.write(`event: products\n`);
    res.write(`data: ${JSON.stringify({ ok: true, data: snapshot })}\n\n`);
  });

  const keepAlive = setInterval(() => {
    res.write('event: ping\n');
    res.write('data: {}\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    unsubscribe();
    res.end();
  });
}

module.exports = {
  getCategories,
  getCategoryWithProducts,
  getProductsByCategory,
  getProducts,
  getFeaturedProducts,
  getTopSellingProducts,
  getDeliverySettings,
  getStoreStatus,
  streamProducts
};