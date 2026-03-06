const db = require('../src/db');

// แสดงรายการ (API)
exports.getSuppliers = (req, res) => {
    db.all("SELECT * FROM suppliers", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ suppliers: rows });
    });
};

// ข้อมูลฟิลด์สำหรับเพิ่ม (API)
exports.addForm = (req, res) => {
    res.json({ fields: ["name", "phone", "email", "address"] });
};

// เพิ่ม (API)
exports.addSupplier = (req, res) => {
    const { name, phone, email, address } = req.body;

    db.run(
        `INSERT INTO suppliers (name, phone, email, address)
         VALUES (?, ?, ?, ?)`,
        [name, phone, email, address],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ success: true, id: this.lastID });
        }
    );
};

// ข้อมูลผู้จำหน่ายเดียว (API)
exports.editForm = (req, res) => {
    const { id } = req.params;

    db.get(
        "SELECT * FROM suppliers WHERE id = ?",
        [id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: "ไม่พบ supplier" });
            res.json({ supplier: row });
        }
    );
};

// อัปเดต (API)
exports.updateSupplier = (req, res) => {
    const id = req.params.id;
    const { name, phone, email, address } = req.body;

    db.run(
        `UPDATE suppliers 
         SET name = ?, phone = ?, email = ?, address = ?
         WHERE id = ?`,
        [name, phone, email, address, id],
        function(err) {
            if (err) return res.status(500).json({ error: "Update error" });
            if (this.changes === 0) return res.status(404).json({ error: "ไม่พบ supplier" });
            res.json({ success: true });
        }
    );
};

// ลบ (API)
exports.deleteSupplier = (req, res) => {
    const id = req.params.id;

    db.run(
        "DELETE FROM suppliers WHERE id = ?",
        [id],
        function(err) {
            if (err) return res.status(500).json({ error: "Delete error" });
            if (this.changes === 0) return res.status(404).json({ error: "ไม่พบ supplier" });
            res.json({ success: true });
        }
    );
};