const db = require('../src/db');

// ======================
// แสดงรายการ
// ======================
exports.getTransactions = (req, res) => {

    const sql = `
        SELECT 
            t.id,
            p.name AS product_name,
            COALESCE(c.name, '-') AS category_name,
            UPPER(t.transaction_type) AS transaction_type,
            t.quantity,
            t.total_price,
            datetime(t.created_at, '+7 hours') AS created_at
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY t.id DESC
    `;

    db.all(sql, [], (err, transactions) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error (transactions)");
        }

        res.render('transactions', {
            transactions,
            currentPage: 'transactions'
        });
    });
};


// ======================
// เพิ่มรายการใหม่ + อัปเดต Stock (แบบปลอดภัย)
// ======================
exports.createTransaction = (req, res) => {

    let { product_id, transaction_type, quantity, total_price } = req.body;

    // แปลงค่า
    quantity = parseInt(quantity);
    total_price = parseFloat(total_price);
    transaction_type = transaction_type?.toUpperCase();

    // ตรวจสอบข้อมูล
    if (!product_id || !transaction_type || quantity <= 0 || isNaN(total_price)) {
        return res.status(400).send("Invalid data");
    }

    if (transaction_type !== 'IN' && transaction_type !== 'OUT') {
        return res.status(400).send("Transaction type must be IN or OUT");
    }

    // เช็ค stock ก่อน
    db.get("SELECT stock FROM products WHERE id = ?", [product_id], (err, product) => {

        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }

        if (!product) {
            return res.status(404).send("Product not found");
        }

        let newStock = product.stock;

        if (transaction_type === 'IN') {
            newStock += quantity;
        } 
        else if (transaction_type === 'OUT') {

            if (product.stock < quantity) {
                return res.status(400).send("Stock ไม่พอ");
            }

            newStock -= quantity;
        }

        // ======================
        // เริ่ม DB Transaction
        // ======================
        db.serialize(() => {

            db.run("BEGIN TRANSACTION");

            db.run(`
                INSERT INTO transactions
                (product_id, transaction_type, quantity, total_price)
                VALUES (?, ?, ?, ?)
            `, [product_id, transaction_type, quantity, total_price], function(err) {

                if (err) {
                    console.error(err);
                    db.run("ROLLBACK");
                    return res.status(500).send("Insert error");
                }

                db.run(
                    "UPDATE products SET stock = ? WHERE id = ?",
                    [newStock, product_id],
                    (err) => {

                        if (err) {
                            console.error(err);
                            db.run("ROLLBACK");
                            return res.status(500).send("Stock update error");
                        }

                        db.run("COMMIT");
                        res.redirect('/dashboard');
                    }
                );

            });

        });

    });
};