const db = require('../src/db');
const bcrypt = require('bcrypt');

// ======================
// แสดงหน้า Login
// ======================
exports.showLogin = (req, res) => {
    res.render('login');
};

// ======================
// แสดงหน้า Register (ดึง employees ไปด้วย)
// ======================
exports.showRegister = (req, res) => {

    db.all(
        "SELECT employee_id, employee_name FROM employees",
        [],
        (err, employees) => {

            if (err) {
                console.log(err);
                return res.send(err.message);
            }

            res.render('register', { employees });
        }
    );
};

// ======================
// สมัครสมาชิก
// ======================
exports.register = async (req, res) => {

    const { username, password, employee_id } = req.body;

    if (!username || !password || !employee_id) {
        return res.send("กรอกข้อมูลไม่ครบ");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (username, password, employee_id)
         VALUES (?, ?, ?)`,
        [username, hashedPassword, employee_id],
        function (err) {

            if (err) {
                console.log(err);
                return res.send(err.message); // แสดง error จริง
            }

            res.redirect('/login');
        }
    );
};

// ======================
// LOGIN
// ======================
exports.login = (req, res) => {

    const { username, password } = req.body;

    db.get(
        `
        SELECT u.id, u.username, u.password, u.employee_id,
               e.employee_name
        FROM users u
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        WHERE u.username = ?
        `,
        [username],
        async (err, user) => {

            if (err) return res.send(err.message);
            if (!user) return res.send("ไม่พบผู้ใช้");

            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.send("รหัสผ่านผิด");

            req.session.user = {
                user_id: user.id,
                username: user.username,
                employee_id: user.employee_id,
                employee_name: user.employee_name
            };

            res.redirect('/');
        }
    );
};

// ======================
// LOGOUT
// ======================
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};