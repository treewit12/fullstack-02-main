const db = require('../src/db');


// ======================
// แสดงรายการทั้งหมด (API)
// ======================
exports.getTransactions = (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const sql = `
        SELECT 
            t.id,
            p.name AS product_name,
            COALESCE(c.name, '-') AS category_name,
            COALESCE(e.employee_name, '-') AS employee_name,
            COALESCE(s.name, '-') AS supplier_name,
            UPPER(t.transaction_type) AS transaction_type,
            t.quantity,
            t.total_price,
            datetime(t.created_at, '+7 hours') AS created_at
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        LEFT JOIN employees e ON t.employee_id = e.employee_id
        ORDER BY t.id DESC
    `;

    db.all(sql, [], (err, transactions) => {

        if (err) {
            console.error("SQL ERROR:", err);
            return res.status(500).json({ error: err.message });
        }

        res.json({ transactions });

    });
};



// ======================
// เพิ่มรายการใหม่ + อัปเดต Stock (API)
// ======================
exports.createTransaction = (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let { product_id, employee_id, transaction_type, quantity, total_price } = req.body;

    product_id = parseInt(product_id);
    employee_id = parseInt(employee_id);
    quantity = parseInt(quantity);
    total_price = parseFloat(total_price);
    transaction_type = transaction_type?.toUpperCase();

    if (
        isNaN(product_id) ||
        isNaN(employee_id) ||
        !transaction_type ||
        isNaN(quantity) || quantity <= 0 ||
        isNaN(total_price)
    ) {
        return res.status(400).json({ error: "Invalid data" });
    }

    if (transaction_type !== 'IN' && transaction_type !== 'OUT') {
        return res.status(400).json({ error: "Transaction type must be IN or OUT" });
    }

    // 🔒 SECURITY CHECK
    if (transaction_type === 'IN' && req.session.user.role !== 'admin') {
        return res.status(403).json({ error: "คุณไม่มีสิทธิ์รับสินค้าเข้า" });
    }

    db.get("SELECT stock FROM products WHERE id = ?", [product_id], (err, product) => {

        if (err) return res.status(500).json({ error: "Database error" });
        if (!product) return res.status(404).json({ error: "Product not found" });

        let newStock = product.stock;

        if (transaction_type === 'IN') {
            newStock += quantity;
        } else {

            if (product.stock < quantity) {
                return res.status(400).json({ error: "Stock ไม่พอ" });
            }

            newStock -= quantity;
        }

        db.serialize(() => {

            db.run("BEGIN TRANSACTION");

            db.run(`
                INSERT INTO transactions
                (product_id, employee_id, transaction_type, quantity, total_price)
                VALUES (?, ?, ?, ?, ?)
            `,
            [product_id, employee_id, transaction_type, quantity, total_price],
            function(err) {

                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: "Insert error" });
                }

                db.run(
                    "UPDATE products SET stock = ? WHERE id = ?",
                    [newStock, product_id],
                    (err) => {

                        if (err) {
                            db.run("ROLLBACK");
                            return res.status(500).json({ error: "Stock update error" });
                        }

                        db.run("COMMIT");
                        res.json({ success: true, newStock });
                    }
                );

            });

        });

    });
};