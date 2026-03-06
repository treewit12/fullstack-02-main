const db = require("../src/db");
const ExcelJS = require("exceljs");

// ===============================
// 📊 Report หน้าแรก (Employee Sales) - API
// ===============================
exports.getReportHome = (req, res) => {
  const sql = `
        SELECT 
            e.employee_name,
            COUNT(t.id) as total_transactions,
            SUM(t.total_price) as total_sales
        FROM transactions t
        JOIN employees e ON t.employee_id = e.employee_id
        WHERE t.transaction_type = 'OUT'
        GROUP BY e.employee_id
        ORDER BY total_sales DESC
    `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error loading report" });
    }

    res.json({ employees: rows, testa: "Hello from API" });
  });
};

// ===============================
// 📦 Stock Report + Daily Sales - API
// ===============================
exports.getStockReport = (req, res) => {
  const stockSQL = `
        SELECT 
            id,
            name,
            price,
            stock
        FROM products
        ORDER BY stock ASC
    `;

  const dailySQL = `
        SELECT 
            DATE(created_at) as sale_date,
            COUNT(id) as total_transactions,
            SUM(total_price) as total_sales
        FROM transactions
        WHERE transaction_type = 'OUT'
        GROUP BY DATE(created_at)
        ORDER BY sale_date DESC
    `;

  db.all(stockSQL, [], (err, products) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error loading stock report" });
    }

    db.all(dailySQL, [], (err, sales) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error loading daily sales" });
      }

      res.json({ products, sales });
    });
  });
};

// ===============================
// 👨‍💻 Employee Sales Report - API
// ===============================
exports.getEmployeeSalesReport = (req, res) => {
  const sql = `
        SELECT 
            e.employee_name,
            COUNT(t.id) as total_transactions,
            SUM(t.total_price) as total_sales
        FROM transactions t
        JOIN employees e ON t.employee_id = e.employee_id
        WHERE t.transaction_type = 'OUT'
        GROUP BY e.employee_id
        ORDER BY total_sales DESC
    `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error loading employee report" });
    }

    res.json({ employees: rows });
  });
};

// ===============================
// 📅 Daily Sales Report - API
// ===============================
exports.getDailySalesReport = (req, res) => {
  const sql = `
        SELECT 
            DATE(created_at) as sale_date,
            COUNT(id) as total_transactions,
            SUM(total_price) as total_sales
        FROM transactions
        WHERE transaction_type = 'OUT'
        GROUP BY DATE(created_at)
        ORDER BY sale_date DESC
    `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error loading daily report" });
    }

    res.json({ sales: rows });
  });
};

// ===============================
// 📊 Export Excel - keep as file download
// ===============================
exports.exportExcel = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  worksheet.columns = [
    { header: "ประเภท", key: "type", width: 15 },
    { header: "จำนวนรายการ", key: "transactions", width: 20 },
    { header: "ราคารวม", key: "sales", width: 20 },
  ];

  const sql = `
        SELECT 
            transaction_type,
            COUNT(id) AS total_transactions,
            SUM(total_price) AS total_sales
        FROM transactions
        GROUP BY transaction_type
    `;

  db.all(sql, [], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Export error" });
    }

    rows.forEach((row) => {
      worksheet.addRow({
        type: row.transaction_type,
        transactions: row.total_transactions,
        sales: row.total_sales,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  });
};
