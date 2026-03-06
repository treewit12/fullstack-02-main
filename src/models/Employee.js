const db = require('../db');

module.exports = {

    // ======================
    // ดึงพนักงานทั้งหมด
    // ======================
    getAll(callback) {
        db.all("SELECT * FROM employees ORDER BY employee_id DESC", callback);
    },

    // ======================
    // ดึงพนักงานตาม ID
    // ======================
    getById(id, callback) {
        db.get("SELECT * FROM employees WHERE employee_id = ?", [id], callback);
    },

    // ======================
    // เพิ่มพนักงานใหม่
    // ======================
    create(data, callback) {
        const sql = `
            INSERT INTO employees (employee_name, position, phone)
            VALUES (?, ?, ?)
        `;
        db.run(sql, [data.employee_name, data.position, data.phone], callback);
    },

    // ======================
    // แก้ไขข้อมูลพนักงาน
    // ======================
    update(id, data, callback) {
        const sql = `
            UPDATE employees 
            SET employee_name = ?, position = ?, phone = ?
            WHERE employee_id = ?
        `;
        db.run(sql, [data.employee_name, data.position, data.phone, id], callback);
    },

    // ======================
    // ลบพนักงาน
    // ======================
    delete(id, callback) {
        db.run("DELETE FROM employees WHERE employee_id = ?", [id], callback);
    }

};