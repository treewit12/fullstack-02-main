const express = require('express');
const router = express.Router();
const db = require('../db'); // เพราะอยู่ใน src

router.get('/', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.send('Database error');
        }

        res.render('products', { products: rows });
    });
});

module.exports = router;