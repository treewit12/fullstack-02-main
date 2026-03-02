const db = require('../src/db');

// แสดงรายการ
exports.getSuppliers = (req, res) => {
    db.all("SELECT * FROM suppliers", [], (err, rows) => {
        if (err) return res.send(err.message);
        res.render('suppliers/index', { suppliers: rows });
    });
};

// หน้าเพิ่ม
exports.addForm = (req, res) => {
    res.render('suppliers/add');
};

// เพิ่ม
exports.addSupplier = (req, res) => {
    const { name, phone, email, address } = req.body;

    db.run(
        `INSERT INTO suppliers (name, phone, email, address)
         VALUES (?, ?, ?, ?)`,
        [name, phone, email, address],
        function(err) {
            if (err) return res.send(err.message);
            res.redirect('/suppliers');
        }
    );
};

// หน้าแก้ไข
exports.editForm = (req, res) => {
    const { id } = req.params;

    db.get(
        "SELECT * FROM suppliers WHERE id = ?",
        [id],
        (err, row) => {
            if (err) return res.send(err.message);
            res.render('suppliers/edit', { supplier: row });
        }
    );
};

// อัปเดต
exports.updateSupplier = (req, res) => {
    const id = req.params.id;
    const { name, phone, email, address } = req.body;

    db.run(
        `UPDATE suppliers 
         SET name = ?, phone = ?, email = ?, address = ?
         WHERE id = ?`,
        [name, phone, email, address, id],
        function(err) {
            if (err) return res.send("Update error");
            res.redirect("/suppliers");
        }
    );
};

// ลบ
exports.deleteSupplier = (req, res) => {
    const id = req.params.id;

    db.run(
        "DELETE FROM suppliers WHERE id = ?",
        [id],
        function(err) {
            if (err) return res.send("Delete error");
            res.redirect("/suppliers");
        }
    );
};