const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const db = require('../src/db');


// ======================
// ข้อมูลสำหรับฟอร์มเพิ่มรายการ (API)
// ======================
router.get('/add', (req, res) => {

    db.all("SELECT * FROM products", [], (err, products) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error loading products" });
        }

        db.all("SELECT * FROM employees", [], (err2, employees) => {

            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: "Error loading employees" });
            }

            res.json({ products, employees });

        });

    });
});


// ======================
// บันทึกข้อมูล
// ======================
router.post('/create', transactionController.createTransaction);


// ======================
// แสดงรายการทั้งหมด
// ======================
router.get('/', transactionController.getTransactions);


module.exports = router;