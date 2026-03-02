const db = require('../src/db');

exports.getDashboard = (req, res) => {

    db.serialize(() => {

        db.get("SELECT COUNT(*) as total FROM products", (err, row1) => {

            db.get("SELECT SUM(quantity) as total FROM transactions WHERE transaction_type='IN'", (err, row2) => {

                db.get("SELECT SUM(quantity) as total FROM transactions WHERE transaction_type='OUT'", (err, row3) => {

                    db.get("SELECT SUM(total_price) as total FROM transactions WHERE transaction_type='OUT'", (err, row4) => {

                        db.all(`
                            SELECT categories.name,
                            ROUND(COUNT(products.id) * 100.0 /
                            (SELECT COUNT(*) FROM products), 0) as percent
                            FROM categories
                            LEFT JOIN products ON products.category_id = categories.id
                            GROUP BY categories.id
                        `, (err, categories) => {

                            db.all(`
                                SELECT p.name as product_name,
                                t.transaction_type,
                                t.quantity,
                                t.created_at
                                FROM transactions t
                                JOIN products p ON p.id = t.product_id
                                ORDER BY t.id DESC
                                LIMIT 5
                            `, (err, recentTransactions) => {

                                res.render('dashboard', {
                                    totalProducts: row1.total || 0,
                                    totalIn: row2.total || 0,
                                    totalOut: row3.total || 0,
                                    totalRevenue: row4.total || 0,
                                    categories,
                                    recentTransactions
                                });

                            });
                        });
                    });
                });
            });
        });
    });
};