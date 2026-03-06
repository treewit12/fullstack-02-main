const express = require("express");
const axios = require("axios");
const router = express.Router();
const API = "http://localhost:3000";

function configWithCookies(req) {
  return {
    headers: { cookie: req.headers.cookie || "" },
    withCredentials: true,
  };
}

// ======================
// Middleware เช็ค login
// ======================
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// ======================
// Middleware เช็ค admin
// ======================
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).send("ไม่มีสิทธิ์เข้าถึง");
  }
  next();
}

// ======================
// แสดงหน้าเพิ่ม user
// ======================
router.get("/add", requireLogin, requireAdmin, (req, res) => {
  axios
    .get(`${API}/users/add`, configWithCookies(req))
    .then((resp) => {
      const employees = resp.data.employees || [];
      res.render("addUser", { employees });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(err.response?.status || 500)
        .send(err.response?.data?.error || "Error loading employees");
    });
});

// ======================
// บันทึก user
// ======================
router.post("/add", requireLogin, requireAdmin, async (req, res) => {
  const { username, password, employee_id, role } = req.body;

  if (!username || !password || !employee_id) {
    return res.send("กรอกข้อมูลไม่ครบ");
  }

  try {
    await axios.post(
      `${API}/users/add`,
      { username, password, employee_id, role: role || "user" },
      configWithCookies(req),
    );

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res
      .status(err.response?.status || 500)
      .send(err.response?.data?.error || "เกิดข้อผิดพลาด");
  }
});

module.exports = router;
