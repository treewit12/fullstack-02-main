const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');

// Controllers
const dashboardController = require('./controllers/dashboardController');
const productController = require('./controllers/productController');
const transactionController = require('./controllers/transactionController');
const supplierController = require('./controllers/supplierController');

// Routes
const supplierRoutes = require('./routes/suppliers');

// ================= BASIC SETUP =================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// current page (ไว้ทำ active menu)
app.use((req, res, next) => {
    res.locals.currentPage = req.path;
    next();
});

// ================= ROUTES =================

// Default
app.get('/', (req, res) => {
    res.redirect('/products');
});

// ================= DASHBOARD =================
app.get('/dashboard', dashboardController.getDashboard);

// ================= PRODUCTS =================
app.get('/products', productController.getProducts);
app.post('/products', productController.addProduct);

app.get('/products/edit/:id', productController.editForm);
app.post('/products/update/:id', productController.updateProduct);

app.delete('/products/:id', productController.deleteProduct);
app.post('/products/sell/:id', productController.sellProduct);

// ================= TRANSACTIONS =================
app.get('/transactions', transactionController.getTransactions);
app.post('/transactions', transactionController.createTransaction);

// ================= SUPPLIERS =================
app.use('/suppliers', supplierRoutes);

// ================= SERVER =================
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});