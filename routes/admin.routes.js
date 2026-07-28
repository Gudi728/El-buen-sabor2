const express = require('express');
const adminController = require('../controllers/admin.controller');
const uploadController = require('../controllers/upload.controller');
const adminAuthMiddleware = require('../middleware/adminAuth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/login', asyncHandler(adminController.login));

router.use(adminAuthMiddleware);

router.get('/bootstrap', asyncHandler(adminController.getBootstrap));
router.post('/categorias', asyncHandler(adminController.createCategory));
router.put('/categorias/:id', asyncHandler(adminController.updateCategory));
router.delete('/categorias/:id', asyncHandler(adminController.deleteCategory));
router.post('/categorias/reordenar', asyncHandler(adminController.reorderCategories));

router.post('/productos', asyncHandler(adminController.createProduct));
router.put('/productos/:id', asyncHandler(adminController.updateProduct));
router.delete('/productos/:id', asyncHandler(adminController.deleteProduct));

router.put('/settings/delivery', asyncHandler(adminController.updateDeliveryCost));
router.put('/settings/horario', asyncHandler(adminController.updateStoreSchedule));
router.post('/uploads/imagen', asyncHandler(uploadController.uploadImage));

module.exports = router;
