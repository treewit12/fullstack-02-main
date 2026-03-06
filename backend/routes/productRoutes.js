const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const dashboardController = require('../controllers/dashboardController');
const transactionController = require('../controllers/transactionController');

// Dashboard
router.get('/dashboard', dashboardController.getDashboard);

// Products
router.get('/products', productController.getProducts);
router.post('/products', productController.addProduct);
router.post('/products/sell/:id', productController.sellProduct);
router.get('/products/edit/:id', productController.editForm);
router.post('/products/update/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Transactions
router.get('/transactions', transactionController.getTransactions);

module.exports = router;