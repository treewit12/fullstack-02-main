const axios = require('axios');
const ExcelJS = require('exceljs');
const API = 'http://localhost:3000';
function configWithCookies(req) {
  return { headers: { cookie: req.headers.cookie || '' }, withCredentials: true };
}


// ===============================
// 📊 Report หน้าแรก (Employee Sales)
// ===============================
exports.getReportHome = async (req, res) => {
  try {
    const resp = await axios.get(`${API}/reports`, configWithCookies(req));
    console.log(resp.data);
    
    res.render('report_home', { employees: resp.data.employees, test: resp.data.testa });
  } catch (err) {
    console.error(err);
    res.send('Error loading report');
  }
};



// ===============================
// 📦 Stock Report + Daily Sales
// ===============================
exports.getStockReport = async (req, res) => {
  try {
    const resp = await axios.get(`${API}/reports/stock`, configWithCookies(req));
    res.render('stock_report', { products: resp.data.products, sales: resp.data.sales });
  } catch (err) {
    console.error(err);
    res.send('Error loading stock report');
  }
};



// ===============================
// 👨‍💻 Employee Sales Report
// ===============================
exports.getEmployeeSalesReport = async (req, res) => {
  try {
    const resp = await axios.get(`${API}/reports/employee-sales`, configWithCookies(req));
    res.render('employee_sales_report', { employees: resp.data.employees });
  } catch (err) {
    console.error(err);
    res.send('Error loading employee report');
  }
};



// ===============================
// 📅 Daily Sales Report
// ===============================
exports.getDailySalesReport = async (req, res) => {
  try {
    const resp = await axios.get(`${API}/reports/daily-sales`, configWithCookies(req));
    res.render('daily_sales_report', { sales: resp.data.sales });
  } catch (err) {
    console.error(err);
    res.send('Error loading daily report');
  }
};



// ===============================
// 📊 Export Excel
// ===============================
exports.exportExcel = (req, res) => {
  // simply redirect to backend endpoint that streams file
  res.redirect('/reports/export/excel');
};