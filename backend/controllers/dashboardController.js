const db = require('../src/db');

exports.getDashboard = (req, res) => {

    db.serialize(() => {

        db.get("SELECT COUNT(*) as total FROM products", (err, row1) => {
            if (err) return res.status(500).json({ error: err.message });

            db.get("SELECT SUM(quantity) as total FROM transactions WHERE transaction_type='IN'", (err, row2) => {
                if (err) return res.status(500).json({ error: err.message });

                db.get("SELECT SUM(quantity) as total FROM transactions WHERE transaction_type='OUT'", (err, row3) => {
                    if (err) return res.status(500).json({ error: err.message });

                    db.get("SELECT SUM(total_price) as total FROM transactions WHERE transaction_type='OUT'", (err, row4) => {
                        if (err) return res.status(500).json({ error: err.message });

                        db.all(`
                            SELECT categories.name,
                            ROUND(COUNT(products.id) * 100.0 /
                            (SELECT COUNT(*) FROM products), 0) as percent
                            FROM categories
                            LEFT JOIN products ON products.category_id = categories.id
                            GROUP BY categories.id
                        `, (err, categories) => {
                            if (err) return res.status(500).json({ error: err.message });

                            db.all(`
                                SELECT p.name as product_name,
                                t.transaction_type,
                                t.quantity,
                                datetime(t.created_at, '+7 hours') as created_at
                                FROM transactions t
                                JOIN products p ON p.id = t.product_id
                                ORDER BY t.id DESC
                                LIMIT 5
                            `, (err, recentTransactions) => {
                                if (err) return res.status(500).json({ error: err.message });

                                res.json({
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