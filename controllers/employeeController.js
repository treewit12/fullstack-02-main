const db = require('../src/db');

// ======================
// แสดงทั้งหมด
// ======================
exports.getEmployees = (req, res) => {
    db.all("SELECT * FROM employees ORDER BY employee_id DESC", [], (err, employees) => {
        if (err) return res.send(err.message);

        res.render("Employees", { employees });
    });
};

// ======================
// หน้าเพิ่ม
// ======================
exports.showAddForm = (req, res) => {
    res.render("addEmployee");
};

// ======================
// เพิ่มข้อมูล
// ======================
exports.createEmployee = (req, res) => {

    const { employee_name, position, phone } = req.body;

    if (!employee_name || !position || !phone) {
        return res.send("กรอกข้อมูลไม่ครบ");
    }

    db.run(
        "INSERT INTO employees (employee_name, position, phone) VALUES (?, ?, ?)",
        [employee_name, position, phone],
        function(err) {
            if (err) return res.send(err.message);

            res.redirect('/employees');
        }
    );
};

// ======================
// หน้าแก้ไข
// ======================
exports.showEditForm = (req, res) => {

    const id = req.params.id;

    db.get("SELECT * FROM employees WHERE employee_id = ?", [id], (err, employee) => {
        if (err) return res.send(err.message);

        res.render("editEmployee", { employee });
    });
};

// ======================
// บันทึกแก้ไข
// ======================
exports.updateEmployee = (req, res) => {

    const id = req.params.id;
    const { employee_name, position, phone } = req.body;

    db.run(
        "UPDATE employees SET employee_name = ?, position = ?, phone = ? WHERE employee_id = ?",
        [employee_name, position, phone, id],
        function(err) {
            if (err) return res.send(err.message);

            res.redirect('/employees');
        }
    );
};

// ======================
// ลบ
// ======================
exports.deleteEmployee = (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM employees WHERE employee_id = ?",
        [id],
        function(err) {
            if (err) return res.send(err.message);

            res.redirect('/employees');
        }
    );
};