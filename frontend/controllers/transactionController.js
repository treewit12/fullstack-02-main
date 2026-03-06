const axios = require('axios');
const API = 'http://localhost:3000';
function configWithCookies(req) {
  return { headers: { cookie: req.headers.cookie || '' }, withCredentials: true };
}

// ======================
// แสดงรายการทั้งหมด
// ======================
exports.getTransactions = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  try {
    const resp = await axios.get(`${API}/transactions`, configWithCookies(req));
    const transactions = resp.data.transactions || [];
    res.render('transactions', {
      transactions,
      currentPage: 'transactions',
      user: req.session.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.response?.data?.error || err.message);
  }
};

// ======================
// เพิ่มรายการใหม่ + อัปเดต Stock
// ======================
exports.createTransaction = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const {
      product_id,
      employee_id,
      transaction_type,
      quantity,
      total_price
    } = req.body;

    await axios.post(
      `${API}/transactions/create`,
      { product_id, employee_id, transaction_type, quantity, total_price },
      configWithCookies(req)
    );
    res.redirect('/transactions');
  } catch (err) {
    console.error(err);
    res.status(400).send(err.response?.data?.error || err.message);
  }
};