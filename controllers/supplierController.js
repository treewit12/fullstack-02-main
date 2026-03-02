const db = require('../src/db');

// แสดงรายการ
exports.getSuppliers = (req, res) => {
    db.all("SELECT * FROM suppliers", [], (err, rows) => {
        if (err) return res.send(err.message);
        res.render('suppliers', { suppliers: rows });
    });
};

// หน้าเพิ่ม
exports.addForm = (req, res) => {
    res.render('suppliers/add');
};

// เพิ่ม
exports.addSupplier = (req, res) => {
    const { name, contact, phone, email, address } = req.body;

    db.run(
        `INSERT INTO suppliers (name, contact, phone, email, address)
         VALUES (?, ?, ?, ?, ?)`,
        [name, contact, phone, email, address],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.redirect('/suppliers');
            }
        }
    );
};

// หน้าแก้ไข
exports.editForm = (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM suppliers WHERE supplier_id = ?", [id], (err, row) => {
        if (err) return res.send(err.message);
        res.render('suppliers/edit', { supplier: row });
    });
};

// อัปเดต
exports.updateSupplier = (req, res) => {
    const { id } = req.params;
    const { supplier_name, phone, email, address } = req.body;

    const sql = `
        UPDATE suppliers
        SET supplier_name = ?, phone = ?, email = ?, address = ?
        WHERE supplier_id = ?
    `;

    db.run(sql, [supplier_name, phone, email, address, id], (err) => {
        if (err) return res.send(err.message);
        res.redirect('/suppliers');
    });
};

// ลบ
exports.deleteSupplier = (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM suppliers WHERE supplier_id = ?", [id], (err) => {
        if (err) return res.send(err.message);
        res.redirect('/suppliers');
    });
};