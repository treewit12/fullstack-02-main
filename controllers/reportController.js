const db = require('../src/db');

exports.getUserPerformance = (req, res) => {

    const sql = `
        SELECT 
            transaction_type,
            COUNT(id) AS total_transactions,
            SUM(quantity) AS total_quantity
        FROM transactions
        GROUP BY transaction_type
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.send("Error loading report");
        }

        res.render('user_performance', { data: rows });
    });
};