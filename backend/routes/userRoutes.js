const express = require('express');
const router = express.Router();
const db = require('../src/db');
const bcrypt = require('bcrypt');

// ======================
// Middleware เช็ค login
// ======================
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// ======================
// Middleware เช็ค admin
// ======================
function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send("ไม่มีสิทธิ์เข้าถึง");
    }
    next();
}

// ======================
// รับข้อมูลการเพิ่ม user (API)
// ======================
router.get('/add', requireLogin, requireAdmin, (req, res) => {

    db.all(`
        SELECT e.*
        FROM employees e
        LEFT JOIN users u ON e.employee_id = u.employee_id
        WHERE u.employee_id IS NULL
    `, (err, employees) => {

        if (err) return res.status(500).json({ error: "Error loading employees" });

        res.json({ employees });
    });
});

// ======================
// เพิ่ม user (API)
// ======================
router.post('/add', requireLogin, requireAdmin, async (req, res) => {

    const { username, password, employee_id, role } = req.body;

    if (!username || !password || !employee_id) {
        return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (username, password, employee_id, role)
         VALUES (?, ?, ?, ?)`,
        [username, hashedPassword, employee_id, role || 'user'],
        function(err) {

            if (err) {
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({ error: "Username นี้ถูกใช้แล้ว" });
                }
                return res.status(500).json({ error: "เกิดข้อผิดพลาด" });
            }

            res.status(201).json({ success: true, id: this.lastID });
        }
    );
});

module.exports = router;