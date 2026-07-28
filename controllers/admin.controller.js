const adminAuthService = require('../services/adminAuth.service');
const menuService = require('../services/menu.service');
const firebaseUserService = require('../services/firebaseUser.service');
const {
  sanitizeText,
  ensureNonEmptyString,
  ensureOptionalUrl,
  ensureNonNegativeNumber
} = require('../utils/validation');

function validateCategoryPayload(payload) {
  return {
    name: ensureNonEmptyString(payload?.name, 'Nombre de categoria', 80),
    image: ensureOptionalUrl(payload?.image, 'Imagen de categoria'),
    isActive: payload?.isActive !== false
  };
}

function validateProductPayload(payload) {
  return {
    name: ensureNonEmptyString(payload?.name, 'Nombre de producto', 120),
    categorySlug: ensureNonEmptyString(payload?.categorySlug, 'Categoria', 120),
    price: ensureNonNegativeNumber(payload?.price, 'Precio'),
    description: sanitizeText(payload?.description, 220),
    ingredients: sanitizeText(payload?.ingredients, 320),
    image: ensureOptionalUrl(payload?.image, 'Imagen de producto'),
    isAvailable: payload?.isAvailable !== false,
    isFeatured: payload?.isFeatured === true,
    soldCount: ensureNonNegativeNumber(payload?.soldCount || 0, 'Ventas acumuladas')
  };
}

function normalizeHourField(value, fieldLabel) {
  const time = sanitizeText(value, 10);
  if (!/^\d{2}:\d{2}$/.test(time)) {
    const error = new Error(`${fieldLabel} invalida`);
    error.statusCode = 400;
    throw error;
  }
  return time;
}

function validateSchedulePayload(payload) {
  const days = payload?.days || {};

  return {
    apertura: normalizeHourField(payload?.openTime, 'Hora de apertura'),
    cierre: normalizeHourField(payload?.closeTime, 'Hora de cierre'),
    cerradoPorHoy: payload?.closedToday === true,
    dias: {
      monday: days.monday === true,
      tuesday: days.tuesday === true,
      wednesday: days.wednesday === true,
      thursday: days.thursday === true,
      friday: days.friday === true,
      saturday: days.saturday === true,
      sunday: days.sunday === true
    }
  };
}

async function login(req, res) {
  const username = ensureNonEmptyString(req.body?.username, 'Usuario', 50);
  const password = ensureNonEmptyString(req.body?.password, 'Contraseña', 80);
  const authResult = adminAuthService.login(username, password);

  if (!authResult) {
    return res.status(401).json({
      ok: false,
      message: 'Credenciales incorrectas'
    });
  }

  await firebaseUserService.syncAdminUser(username);

  return res.status(200).json({
    ok: true,
    data: authResult
  });
}

async function getBootstrap(req, res) {
  const data = await menuService.getAdminSnapshot();
  return res.status(200).json({ ok: true, data });
}

async function createCategory(req, res) {
  const payload = validateCategoryPayload(req.body || {});
  const category = await menuService.createCategory(payload);
  return res.status(201).json({ ok: true, data: category });
}

async function updateCategory(req, res) {
  const categoryId = ensureNonEmptyString(req.params.id, 'ID de categoria', 100);
  const payload = {
    ...(typeof req.body?.name === 'string' ? { name: sanitizeText(req.body.name, 80) } : {}),
    ...(typeof req.body?.image === 'string' ? { image: ensureOptionalUrl(req.body.image, 'Imagen de categoria') } : {}),
    ...(typeof req.body?.isActive === 'boolean' ? { isActive: req.body.isActive } : {})
  };

  const category = await menuService.updateCategory(categoryId, payload);
  if (!category) {
    return res.status(404).json({ ok: false, message: 'Categoria no encontrada' });
  }
  return res.status(200).json({ ok: true, data: category });
}

async function deleteCategory(req, res) {
  const categoryId = ensureNonEmptyString(req.params.id, 'ID de categoria', 100);
  const deleted = await menuService.deleteCategory(categoryId);
  if (!deleted) {
    return res.status(404).json({ ok: false, message: 'Categoria no encontrada' });
  }
  return res.status(200).json({ ok: true });
}

async function reorderCategories(req, res) {
  const { orderedIds } = req.body || {};
  const safeIds = Array.isArray(orderedIds)
    ? orderedIds.map((item) => sanitizeText(item, 120)).filter(Boolean)
    : [];

  const categories = await menuService.reorderCategories(safeIds);
  return res.status(200).json({ ok: true, data: categories });
}

async function createProduct(req, res) {
  const payload = validateProductPayload(req.body || {});
  const product = await menuService.createProduct(payload);
  return res.status(201).json({ ok: true, data: product });
}

async function updateProduct(req, res) {
  const productId = ensureNonEmptyString(req.params.id, 'ID de producto', 100);
  const payload = {
    ...(typeof req.body?.name === 'string' ? { name: sanitizeText(req.body.name, 120) } : {}),
    ...(typeof req.body?.categorySlug === 'string' ? { categorySlug: sanitizeText(req.body.categorySlug, 120) } : {}),
    ...(req.body?.price !== undefined ? { price: ensureNonNegativeNumber(req.body.price, 'Precio') } : {}),
    ...(typeof req.body?.description === 'string' ? { description: sanitizeText(req.body.description, 220) } : {}),
    ...(typeof req.body?.ingredients === 'string' ? { ingredients: sanitizeText(req.body.ingredients, 320) } : {}),
    ...(typeof req.body?.image === 'string' ? { image: ensureOptionalUrl(req.body.image, 'Imagen de producto') } : {}),
    ...(typeof req.body?.isAvailable === 'boolean' ? { isAvailable: req.body.isAvailable } : {}),
    ...(typeof req.body?.isFeatured === 'boolean' ? { isFeatured: req.body.isFeatured } : {}),
    ...(req.body?.soldCount !== undefined ? { soldCount: ensureNonNegativeNumber(req.body.soldCount, 'Ventas acumuladas') } : {})
  };

  const product = await menuService.updateProduct(productId, payload);
  if (!product) {
    return res.status(404).json({ ok: false, message: 'Producto no encontrado' });
  }
  return res.status(200).json({ ok: true, data: product });
}

async function deleteProduct(req, res) {
  const productId = ensureNonEmptyString(req.params.id, 'ID de producto', 100);
  const deleted = await menuService.deleteProduct(productId);
  if (!deleted) {
    return res.status(404).json({ ok: false, message: 'Producto no encontrado' });
  }
  return res.status(200).json({ ok: true });
}

async function updateDeliveryCost(req, res) {
  const deliveryCost = ensureNonNegativeNumber(req.body?.deliveryCost, 'Costo de delivery');

  const settings = await menuService.updateDeliveryCost(deliveryCost);
  return res.status(200).json({ ok: true, data: settings });
}

async function updateStoreSchedule(req, res) {
  const payload = validateSchedulePayload(req.body || {});
  const schedule = await menuService.updateStoreSchedule(payload);

  return res.status(200).json({
    ok: true,
    data: {
      openTime: schedule.apertura,
      closeTime: schedule.cierre,
      closedToday: schedule.cerradoPorHoy,
      days: schedule.dias
    }
  });
}

module.exports = {
  login,
  getBootstrap,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  updateDeliveryCost,
  updateStoreSchedule
};
