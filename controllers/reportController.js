const db = require('../src/db');
const ExcelJS = require('exceljs');


// ===============================
// 📊 Report หน้าแรก (Employee Sales)
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
            return res.send("Error loading report");
        }

        res.render('report_home', {
            employees: rows
        });

    });
};



// ===============================
// 📦 Stock Report + Daily Sales
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
            return res.send("Error loading stock report");
        }

        db.all(dailySQL, [], (err, sales) => {

            if (err) {
                console.error(err);
                return res.send("Error loading daily sales");
            }

            res.render('stock_report', {
                products: products,
                sales: sales
            });

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
            SUM(total_price) as total_sales
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
        { header: 'ราคารวม', key: 'sales', width: 20 }
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
            return res.send("Export error");
        }

        rows.forEach(row => {

            worksheet.addRow({
                type: row.transaction_type,
                transactions: row.total_transactions,
                sales: row.total_sales
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