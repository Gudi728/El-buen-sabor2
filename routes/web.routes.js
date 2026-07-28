const express = require('express');
const pageController = require('../controllers/page.controller');

const router = express.Router();

router.get('/', pageController.renderIndex);

router.use((req, res, next) => {
	const rawPath = String(req.originalUrl || req.url || '').split('?')[0].toLowerCase();

	if (rawPath.startsWith('/categor%c3%ada') || rawPath.startsWith('/categor%c3%adas') || rawPath.startsWith('/categor%eda') || rawPath.startsWith('/categor%edas')) {
		return res.redirect(302, rawPath.replace(/^\/categor(?:%c3%ad|%ed)a(?:s)?/, '/categoria'));
	}

	return next();
});

router.get('/categoria', pageController.renderCategoria);
router.get('/categoria/:slug', pageController.renderCategoria);
router.get('/categorias', pageController.renderCategoria);
router.get('/categorias/:slug', pageController.renderCategoria);

router.get('/categoría', (req, res) => res.redirect(302, '/categoria'));
router.get('/categorías', (req, res) => res.redirect(302, '/categoria'));
router.get('/categoría/:slug', (req, res) => res.redirect(302, `/categoria/${req.params.slug}`));
router.get('/categorías/:slug', (req, res) => res.redirect(302, `/categoria/${req.params.slug}`));

router.get('/carrito', pageController.renderCarrito);
router.get('/admin', pageController.renderAdmin);

module.exports = router;
