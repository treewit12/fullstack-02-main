const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// หน้า Report
router.get('/', reportController.getUserPerformance);
router.get('/user-performance', reportController.getUserPerformance);

// ✅ Export Excel
router.get('/export/excel', reportController.exportExcel);

module.exports = router;