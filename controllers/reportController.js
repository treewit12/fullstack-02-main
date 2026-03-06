const db = require('../src/db');
const ExcelJS = require('exceljs');


// ===============================
// 📊 Report หน้าแรก
// ===============================
exports.getReportHome = (req, res) => {

    res.render('report_home');

};



// ===============================
// 📦 Stock Report
// ===============================
exports.getStockReport = (req, res) => {

    const sql = `
        SELECT 
            id,
            name,
            price,
            stock
        FROM products
        ORDER BY stock ASC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            console.error(err);
            return res.send("Error loading stock report");
        }

        res.render('stock_report', {
            products: rows
        });

    });

};



// ===============================
// 👨‍💻 Employee Sales Report
// ===============================
exports.getEmployeeSalesReport = (req, res) => {

    const sql = `
        SELECT 
            e.employee_name,
            COUNT(t.id) as total_transactions,
            SUM(t.quantity) as total_quantity
        FROM transactions t
        JOIN employees e ON t.employee_id = e.employee_id
        WHERE t.transaction_type = 'OUT'
        GROUP BY e.employee_id
        ORDER BY total_quantity DESC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            console.error(err);
            return res.send("Error loading employee report");
        }

        res.render('employee_sales_report', {
            employees: rows
        });

    });

};



// ===============================
// 📅 Daily Sales Report
// ===============================
exports.getDailySalesReport = (req, res) => {

    const sql = `
        SELECT 
            DATE(created_at) as sale_date,
            COUNT(id) as total_transactions,
            SUM(quantity) as total_quantity
        FROM transactions
        WHERE transaction_type = 'OUT'
        GROUP BY DATE(created_at)
        ORDER BY sale_date DESC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            console.error(err);
            return res.send("Error loading daily report");
        }

        res.render('daily_sales_report', {
            sales: rows
        });

    });

};



// ===============================
// 📊 Export Excel
// ===============================
exports.exportExcel = async (req, res) => {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    worksheet.columns = [
        { header: 'ประเภท', key: 'type', width: 15 },
        { header: 'จำนวนรายการ', key: 'transactions', width: 20 },
        { header: 'จำนวนสินค้ารวม', key: 'quantity', width: 20 }
    ];

    const sql = `
        SELECT 
            transaction_type,
            COUNT(id) AS total_transactions,
            SUM(quantity) AS total_quantity
        FROM transactions
        GROUP BY transaction_type
    `;

    db.all(sql, [], async (err, rows) => {

        if (err) {
            console.error(err);
            return res.send("Export error");
        }

        rows.forEach(row => {

            worksheet.addRow({
                type: row.transaction_type,
                transactions: row.total_transactions,
                quantity: row.total_quantity
            });

        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=report.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();

    });

};