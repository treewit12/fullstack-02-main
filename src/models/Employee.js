const db = require('../db');

module.exports = {

    getAll(callback) {
        db.all("SELECT * FROM employees ORDER BY employee_id DESC", callback);
    },

    create(data, callback) {
        db.run(
            `INSERT INTO employees (employee_name, position, phone)
             VALUES (?, ?, ?)`,
            [data.employee_name, data.position, data.phone],
            callback
        );
    },

    delete(id, callback) {
        db.run("DELETE FROM employees WHERE employee_id = ?", [id], callback);
    }

};