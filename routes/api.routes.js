const express = require('express');
const contactController = require('../controllers/contact.controller');
const menuController = require('../controllers/menu.controller');
const orderController = require('../controllers/order.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'API online' });
});

router.get('/contacto', contactController.getContactInfo);
router.get('/categorias', asyncHandler(menuController.getCategories));
router.get('/categorias/:slug', asyncHandler(menuController.getCategoryWithProducts));
router.get('/categorias/:slug/productos', asyncHandler(menuController.getProductsByCategory));
router.get('/productos', asyncHandler(menuController.getProducts));
router.get('/productos/stream', menuController.streamProducts);
router.get('/productos/destacados', asyncHandler(menuController.getFeaturedProducts));
router.get('/productos/mas-vendidos', asyncHandler(menuController.getTopSellingProducts));
router.get('/settings/delivery', asyncHandler(menuController.getDeliverySettings));
router.get('/local/status', asyncHandler(menuController.getStoreStatus));
router.post('/pedidos', asyncHandler(orderController.createOrder));

module.exports = router;
