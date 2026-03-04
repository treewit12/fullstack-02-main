const db = require('../src/db');
const ExcelJS = require('exceljs');


// ===============================
// 📊 หน้า Report หลัก
// ===============================
exports.getUserPerformance = (req, res) => {

    // สรุป IN / OUT
    const summarySQL = `
        SELECT 
            transaction_type,
            COUNT(id) AS total_transactions,
            SUM(quantity) AS total_quantity
        FROM transactions
        GROUP BY transaction_type
    `;

    db.all(summarySQL, [], (err, summary) => {
        if (err) {
            console.error(err);
            return res.send("Error loading summary");
        }

        // 🏆 Top 5 ขายดีที่สุด
        const topSoldSQL = `
            SELECT p.name, SUM(t.quantity) as total_sold
            FROM transactions t
            JOIN products p ON t.product_id = p.id
            WHERE t.transaction_type = 'OUT'
            GROUP BY p.id
            ORDER BY total_sold DESC
            LIMIT 5
        `;

        db.all(topSoldSQL, [], (err, topSold) => {
            if (err) return res.send("Error loading top sold");

            // 📦 Top 5 รับเข้ามากสุด
            const topInSQL = `
                SELECT p.name, SUM(t.quantity) as total_in
                FROM transactions t
                JOIN products p ON t.product_id = p.id
                WHERE t.transaction_type = 'IN'
                GROUP BY p.id
                ORDER BY total_in DESC
                LIMIT 5
            `;

            db.all(topInSQL, [], (err, topIn) => {
                if (err) return res.send("Error loading top in");

                // ⚠️ สินค้าใกล้หมด
                const lowStockSQL = `
                    SELECT name, stock
                    FROM products
                    WHERE stock <= 10
                    ORDER BY stock ASC
                    LIMIT 5
                `;

                db.all(lowStockSQL, [], (err, lowStock) => {
                    if (err) return res.send("Error loading low stock");

                    res.render('user_performance', {
                        summary,
                        topSold,
                        topIn,
                        lowStock
                    });
                });
            });
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