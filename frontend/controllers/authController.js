const axios = require("axios");
// backend URL (same server)
const API = "http://localhost:3000";

function configWithCookies(req) {
  return {
    headers: { cookie: req.headers.cookie || "" },
    withCredentials: true,
  };
}

// ======================
// แสดงหน้า Login
// ======================
exports.showLogin = async (req, res) => {
  try {
    // optional: query backend for any metadata
    await axios.get(`${API}/login`, configWithCookies(req));
  } catch (e) {
    // ignore
  }
  res.render("login");
};

// ======================
// แสดงหน้า Register
// ======================
exports.showRegister = async (req, res) => {
  try {
    const resp = await axios.get(`${API}/register`, configWithCookies(req));
    const employees = resp.data.employees || [];
    res.render("register", { employees });
  } catch (err) {
    console.error(err);
    res.send("Error loading employees");
  }
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
    const resp = await axios.post(
      `${API}/register`,
      { username, password, employee_id },
      configWithCookies(req),
    );
    // success, redirect to login
    return res.redirect("/login");
  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.error || err.message;
    return res.send(msg);
  }
};

// ======================
// LOGIN
// ======================
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const resp = await axios.post(
      `${API}/login`,
      { username, password },
      configWithCookies(req),
    );

    // Keep frontend session in sync with backend auth so route guards pass.
    req.session.user = resp.data?.user;

    // forward set-cookie header so client gets session cookie
    const setCookie = resp.headers["set-cookie"];
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }
    console.log(resp.data);
    return res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.error || err.message;
    return res.send(msg);
  }
};

// ======================
// LOGOUT
// ======================
exports.logout = async (req, res) => {
  try {
    const resp = await axios.get(`${API}/logout`, configWithCookies(req));

    // Clear frontend session as well.
    req.session.destroy(() => {});

    const setCookie = resp.headers["set-cookie"];
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.send("Logout ไม่สำเร็จ");
  }
};
