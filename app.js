const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');

// Controllers
const dashboardController = require('./controllers/dashboardController');
const productController = require('./controllers/productController');

// Routes
const supplierRoutes = require('./routes/suppliers');
const employeeRoutes = require('./routes/employeeRoutes');
const transactionRoutes = require('./routes/transactionRoutes'); // ✅ แก้ตรงนี้

// ================= BASIC SETUP =================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use((req, res, next) => {
    res.locals.currentPage = req.path;
    next();
});

// ================= ROUTES =================
app.get('/', (req, res) => {
    res.redirect('/products');
});

app.get('/dashboard', dashboardController.getDashboard);

app.get('/products', productController.getProducts);
app.post('/products', productController.addProduct);
app.get('/products/edit/:id', productController.editForm);
app.post('/products/update/:id', productController.updateProduct);
app.delete('/products/:id', productController.deleteProduct);
app.post('/products/sell/:id', productController.sellProduct);

// ✅ ใช้ router
app.use('/transactions', transactionRoutes);

app.use('/suppliers', supplierRoutes);
app.use('/employees', employeeRoutes);

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});