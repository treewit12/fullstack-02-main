const db = require("../src/db");
const bcrypt = require("bcrypt");

// ======================
// หน้าเข้าสู่ระบบ (API)
// ======================
exports.showLogin = (req, res) => {
  res.json({ message: "Please POST credentials to /login" });
};

// ======================
// ข้อมูลจำเป็นสำหรับลงทะเบียน (API)
// ======================
exports.showRegister = (req, res) => {
  const sql = `
        SELECT employee_id, employee_name
        FROM employees
    `;

  db.all(sql, [], (err, employees) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }

    res.json({ employees });
  });
};

// ======================
// REGISTER USER (API)
// ======================
exports.register = async (req, res) => {
  const { username, password, employee_id } = req.body;

  if (!username || !password || !employee_id) {
    return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
            INSERT INTO users (username, password, employee_id, role)
            VALUES (?, ?, ?, 'user')
        `;

    db.run(sql, [username, hashedPassword, employee_id], function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ success: true, userId: this.lastID });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
};

// ======================
// LOGIN (API)
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
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
    }

    // SESSION LOGIN
    req.session.user = {
      user_id: user.id,
      username: user.username,
      role: user.role,
      employee_id: user.employee_id,
      employee_name: user.employee_name,
    };

    req.session.save((saveErr) => {
      if (saveErr) {
        console.log(saveErr);
        return res.status(500).json({ error: "Session save failed" });
      }

      res.json({ success: true, user: req.session.user });
    });
  });
};

// ======================
// LOGOUT (API)
// ======================
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout ไม่สำเร็จ" });
    }

    res.json({ success: true });
  });
};
