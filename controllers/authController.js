const db = require('../src/db');
const bcrypt = require('bcrypt');


// ======================
// แสดงหน้า Login
// ======================
exports.showLogin = (req, res) => {
    res.render('login');
};


// ======================
// แสดงหน้า Register
// ======================
exports.showRegister = (req, res) => {

    const sql = `
        SELECT employee_id, employee_name
        FROM employees
    `;

    db.all(sql, [], (err, employees) => {

        if (err) {
            console.log(err);
            return res.send(err.message);
        }

        res.render('register', { employees });
    });
};


// ======================
// REGISTER USER
// ======================
exports.register = async (req, res) => {

    const { username, password, employee_id } = req.body;

    if (!username || !password || !employee_id) {
        return res.send("กรอกข้อมูลไม่ครบ");
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (username, password, employee_id, role)
            VALUES (?, ?, ?, 'user')
        `;

        db.run(
            sql,
            [username, hashedPassword, employee_id],
            function (err) {

                if (err) {
                    console.log(err);
                    return res.send(err.message);
                }

                res.redirect('/login');
            }
        );

    } catch (error) {
        console.log(error);
        res.send("เกิดข้อผิดพลาด");
    }
};


// ======================
// LOGIN
// ======================
exports.login = (req, res) => {

    const { username, password } = req.body;

    const sql = `
        SELECT 
            u.id,
            u.username,
            u.password,
            u.role,
            u.employee_id,
            e.employee_name
        FROM users u
        LEFT JOIN employees e 
        ON u.employee_id = e.employee_id
        WHERE u.username = ?
    `;

    db.get(sql, [username], async (err, user) => {

        if (err) {
            console.log(err);
            return res.send(err.message);
        }

        if (!user) {
            return res.send("ไม่พบผู้ใช้");
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.send("รหัสผ่านไม่ถูกต้อง");
        }

        // SESSION LOGIN
        req.session.user = {
            user_id: user.id,
            username: user.username,
            role: user.role,
            employee_id: user.employee_id,
            employee_name: user.employee_name
        };

        res.redirect('/dashboard');
    });

};


// ======================
// LOGOUT
// ======================
exports.logout = (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Logout ไม่สำเร็จ");
        }

        res.redirect('/login');

    });

};