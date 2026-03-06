const db = require('../src/db');


// ======================
// แสดงทั้งหมด (API)
// ======================
exports.getEmployees = (req, res) => {

    db.all(
        "SELECT * FROM employees ORDER BY employee_id ASC",
        [],
        (err, employees) => {

            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Database error" });
            }

            res.json({ employees });
        }
    );
};



// ======================
// ข้อมูลฟิลด์สำหรับสร้าง
// ======================
exports.showAddForm = (req, res) => {
    // ถ้าไม่มีข้อมูลพิเศษให้ส่งกลับ
    res.json({ fields: ["employee_name", "position", "phone"] });
};



// ======================
// เพิ่มข้อมูล (API)
// ======================
exports.createEmployee = (req, res) => {

    const { employee_name, position, phone } = req.body;

    if (!employee_name || !position || !phone) {
        return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });
    }

    db.run(
        "INSERT INTO employees (employee_name, position, phone) VALUES (?, ?, ?)",
        [employee_name, position, phone],
        function (err) {

            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Insert error" });
            }

            res.status(201).json({ success: true, id: this.lastID });
        }
    );
};



// ======================
// ข้อมูลพนักงานเดียว
// ======================
exports.showEditForm = (req, res) => {

    const id = req.params.id;

    db.get(
        "SELECT * FROM employees WHERE employee_id = ?",
        [id],
        (err, employee) => {

            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Database error" });
            }

            if (!employee) {
                return res.status(404).json({ error: "ไม่พบพนักงาน" });
            }

            res.json({ employee });
        }
    );
};



// ======================
// บันทึกแก้ไข (API)
// ======================
exports.updateEmployee = (req, res) => {

    const id = req.params.id;
    const { employee_name, position, phone } = req.body;

    if (!employee_name || !position || !phone) {
        return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });
    }

    db.run(
        "UPDATE employees SET employee_name = ?, position = ?, phone = ? WHERE employee_id = ?",
        [employee_name, position, phone, id],
        function (err) {

            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Update error" });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "ไม่พบพนักงานที่จะแก้ไข" });
            }

            res.json({ success: true });
        }
    );
};



// ======================
// ลบ (API)
// ======================
exports.deleteEmployee = (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM employees WHERE employee_id = ?",
        [id],
        function (err) {

            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Delete error" });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "ไม่พบพนักงานที่ต้องการลบ" });
            }

            res.json({ success: true });
        }
    );
};