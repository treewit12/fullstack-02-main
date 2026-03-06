const express = require("express");
const axios = require("axios");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const API = "http://localhost:3000";

function configWithCookies(req) {
  return {
    headers: { cookie: req.headers.cookie || "" },
    withCredentials: true,
  };
}

// ======================
// แสดงหน้าเพิ่มรายการ
// ======================
router.get("/add", async (req, res) => {
  try {
    const [employeesResp, productsResp] = await Promise.all([
      axios.get(`${API}/employees`, configWithCookies(req)),
      axios.get(`${API}/products`, configWithCookies(req)),
    ]);

    res.render("addTransaction", {
      products: productsResp.data.products || [],
      employees: employeesResp.data.employees || [],
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(err.response?.data?.error || "Error loading add transaction page");
  }
});

// ======================
// บันทึกข้อมูล
// ======================
router.post("/create", transactionController.createTransaction);

// ======================
// แสดงรายการทั้งหมด
// ======================
router.get("/", transactionController.getTransactions);

module.exports = router;
