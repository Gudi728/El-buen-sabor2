const crypto = require('crypto');
const { getFirestore } = require('../config/firebase');
const menuService = require('./menu.service');
const {
  sanitizeText,
  ensureNonEmptyString,
  ensureNonNegativeNumber,
  ensurePhone
} = require('../utils/validation');

const localOrders = [];

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      productId: sanitizeText(item.productId),
      categoryId: sanitizeText(item.categoryId),
      categorySlug: sanitizeText(item.categorySlug),
      categoryName: sanitizeText(item.categoryName),
      name: sanitizeText(item.name, 120),
      image: sanitizeText(item.image),
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0,
      note: sanitizeText(item.note, 220)
    }))
    .filter((item) => item.productId && item.name && item.price >= 0 && item.quantity > 0);
}

function validateOrderPayload(payload) {
  const firstName = ensureNonEmptyString(payload.firstName, 'Nombre', 80);
  const lastName = ensureNonEmptyString(payload.lastName, 'Apellido', 80);
  const phone = ensurePhone(payload.phone, 'Telefono');
  const orderType = payload.orderType === 'delivery' ? 'delivery' : 'pickup';
  const items = normalizeItems(payload.items);

  const deliveryAddress = sanitizeText(payload.deliveryAddress, 220);
  const deliveryReference = sanitizeText(payload.deliveryReference, 220);
  const desiredTime = sanitizeText(payload.desiredTime, 10);
  const generalNotes = sanitizeText(payload.generalNotes, 320);

  if (!firstName || !lastName || !phone || !items.length) {
    throw new Error('Datos de pedido incompletos');
  }

  if (orderType === 'delivery' && (!deliveryAddress || !deliveryReference || !desiredTime)) {
    throw new Error('Datos de delivery incompletos');
  }

  if (desiredTime && !/^\d{2}:\d{2}$/.test(desiredTime)) {
    throw new Error('Hora deseada invalida');
  }

  return {
    firstName,
    lastName,
    phone,
    orderType,
    items,
    deliveryAddress,
    deliveryReference,
    desiredTime,
    generalNotes
  };
}

async function createOrder(payload) {
  const normalized = validateOrderPayload(payload || {});
  const storeStatus = await menuService.getPublicStoreStatus();

  if (!storeStatus.canPlaceOrders) {
    const error = new Error(
      'En este momento la rotiseria se encuentra cerrada. Los pedidos estaran disponibles cuando volvamos a abrir.'
    );
    error.statusCode = 409;
    throw error;
  }

  for (const item of normalized.items) {
    const currentProduct = await menuService.getPublicProductById(item.productId);
    if (!currentProduct || !currentProduct.isAvailable) {
      const unavailableError = new Error(
        `El producto ${item.name || 'seleccionado'} esta agotado en este momento.`
      );
      unavailableError.statusCode = 409;
      throw unavailableError;
    }
  }

  const settings = await menuService.getPublicDeliverySettings();

  const subtotal = normalized.items.reduce((acc, item) => {
    const validPrice = ensureNonNegativeNumber(item.price, 'Precio de item');
    const validQuantity = ensureNonNegativeNumber(item.quantity, 'Cantidad de item');
    return acc + validPrice * validQuantity;
  }, 0);
  const deliveryCost = normalized.orderType === 'delivery' ? Number(settings.deliveryCost) || 0 : 0;
  const total = subtotal + deliveryCost;

  const order = {
    id: crypto.randomUUID(),
    customer: {
      firstName: normalized.firstName,
      lastName: normalized.lastName,
      phone: normalized.phone
    },
    orderType: normalized.orderType,
    items: normalized.items,
    summary: {
      subtotal,
      deliveryCost,
      total
    },
    delivery: {
      address: normalized.deliveryAddress,
      reference: normalized.deliveryReference,
      desiredTime: normalized.desiredTime
    },
    generalNotes: normalized.generalNotes,
    status: 'pendiente',
    createdAt: new Date().toISOString()
  };

  const db = getFirestore();
  if (db) {
    await db.collection('pedidos').doc(order.id).set(order);
  } else {
    localOrders.push(order);
  }

  await menuService.registerOrderSale(order.items);

  return order;
}

module.exports = {
  createOrder
};
