const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const productsController = require('../controllers/products');

router.get('/', productsController.get_all_products);

router.post('/', checkAuth, productsController.create_product);

router.get('/:productId', productsController.product_details);

router.patch('/:productId', checkAuth, productsController.update_product);

router.delete('/:productId', checkAuth, productsController.delete_product);

module.exports = router;