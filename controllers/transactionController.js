const db = require('../src/db');


// ======================
// แสดงรายการทั้งหมด
// ======================
exports.getTransactions = (req, res) => {

    const sql = `
        SELECT 
            t.id,
            p.name AS product_name,
            COALESCE(c.name, '-') AS category_name,
            COALESCE(e.employee_name, '-') AS employee_name,
            UPPER(t.transaction_type) AS transaction_type,
            t.quantity,
            t.total_price,
            datetime(t.created_at, '+7 hours') AS created_at
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN employees e ON t.employee_id = e.employee_id
        ORDER BY t.id DESC
    `;

    db.all(sql, [], (err, transactions) => {

        if (err) {
            console.error("SQL ERROR:", err);
            return res.status(500).send(err.message);
        }

        res.render('transactions', {
            transactions,
            currentPage: 'transactions'
        });

    });
};



// ======================
// แสดงหน้าเพิ่ม Transaction
// ======================
exports.showCreateForm = (req, res) => {

    db.all("SELECT id, name FROM products", [], (err, products) => {
        if (err) return res.status(500).send(err.message);

        db.all("SELECT employee_id, employee_name FROM employees", [], (err, employees) => {
            if (err) return res.status(500).send(err.message);

            res.render("addTransaction", {
                products,
                employees,
                currentPage: 'transactions'
            });
        });
    });
};



// ======================
// เพิ่มรายการใหม่ + อัปเดต Stock
// ======================
exports.createTransaction = (req, res) => {

    console.log("BODY:", req.body); // 👈 debug ดูค่าที่ส่งมา

    let { product_id, employee_id, transaction_type, quantity, total_price } = req.body;

    product_id = parseInt(product_id);
    employee_id = parseInt(employee_id);
    quantity = parseInt(quantity);
    total_price = parseFloat(total_price);
    transaction_type = transaction_type ? transaction_type.toUpperCase() : null;

    if (
        isNaN(product_id) ||
        isNaN(employee_id) ||
        !transaction_type ||
        isNaN(quantity) || quantity <= 0 ||
        isNaN(total_price)
    ) {
        return res.status(400).send("Invalid data");
    }

    if (transaction_type !== 'IN' && transaction_type !== 'OUT') {
        return res.status(400).send("Transaction type must be IN or OUT");
    }

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
        } else {

            if (product.stock < quantity) {
                return res.status(400).send("Stock ไม่พอ");
            }

            newStock -= quantity;
        }

        db.serialize(() => {

            db.run("BEGIN TRANSACTION");

            db.run(`
                INSERT INTO transactions
                (product_id, employee_id, transaction_type, quantity, total_price)
                VALUES (?, ?, ?, ?, ?)
            `, [product_id, employee_id, transaction_type, quantity, total_price], function(err) {

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
                        res.redirect('/transactions');
                    }
                );

            });

        });

    });
};