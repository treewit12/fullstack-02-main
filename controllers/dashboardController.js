const db = require('../src/db');

exports.getDashboard = (req, res) => {

    const summarySql = `
        SELECT
            (SELECT COUNT(*) FROM products) AS total_products,
            (SELECT COUNT(*) FROM products WHERE stock <= 2) AS low_stock,
            (SELECT IFNULL(SUM(quantity), 0) FROM transactions WHERE transaction_type = 'IN') AS total_in,
            (SELECT IFNULL(SUM(quantity), 0) FROM transactions WHERE transaction_type = 'OUT') AS total_out
    `;

    const categorySql = `
        SELECT c.name, IFNULL(SUM(p.stock), 0) AS total_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        GROUP BY c.name
    `;

    const recentSql = `
        SELECT p.name, t.quantity, t.transaction_type, t.created_at
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.id
        ORDER BY t.id DESC
        LIMIT 5
    `;

    db.get(summarySql, [], (err, summary) => {
        if (err) return console.error(err);

        db.all(categorySql, [], (err, categories) => {
            if (err) return console.error(err);

            db.all(recentSql, [], (err, recent) => {
                if (err) return console.error(err);

                res.render('dashboard', {
                    summary,
                    categories,
                    recent
                });
            });
        });
    });
};