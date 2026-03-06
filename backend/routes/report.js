const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');


// ===============================
// 📊 หน้า Report หลัก
// ===============================
router.get('/', reportController.getReportHome);


// ===============================
// 📦 Stock Report
// ===============================
router.get('/stock', reportController.getStockReport);


// ===============================
// 👨‍💻 Employee Sales Report
// ===============================
router.get('/employee-sales', reportController.getEmployeeSalesReport);


// ===============================
// 📅 Daily Sales Report
// ===============================
router.get('/daily-sales', reportController.getDailySalesReport);


// ===============================
// 📊 Export Excel
// ===============================
router.get('/export/excel', reportController.exportExcel);


module.exports = router;