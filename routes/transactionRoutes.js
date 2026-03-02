const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const db = require('../src/db');

// แสดงหน้าเพิ่มรายการ
router.get('/add', (req, res) => {
    db.all("SELECT * FROM products", [], (err, products) => {
        if (err) return res.send("Error loading products");

        res.render('addTransaction', { products });
    });
});

// บันทึกข้อมูล
router.post('/create', transactionController.createTransaction);

// แสดงรายการทั้งหมด
router.get('/', transactionController.getTransactions);

module.exports = router;