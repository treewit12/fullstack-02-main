const db = require('../src/db');


// ==========================
// แสดงสินค้า (API)
// ==========================
exports.getProducts = (req, res) => {

    const sql = `
        SELECT 
            products.*, 
            categories.name AS category_name,
            suppliers.name AS supplier_name
        FROM products
        LEFT JOIN categories 
            ON products.category_id = categories.id
        LEFT JOIN suppliers 
            ON products.supplier_id = suppliers.id
        ORDER BY products.id DESC
    `;

    db.all(sql, [], (err, products) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all("SELECT * FROM categories", [], (err, categories) => {
            if (err) return res.status(500).json({ error: err.message });

            db.all("SELECT * FROM suppliers", [], (err, suppliers) => {
                if (err) return res.status(500).json({ error: err.message });

                res.json({ products, categories, suppliers });
            });
        });
    });
};


// ==========================
// ข้อมูลสินค้าเดียว
// ==========================
exports.editForm = (req, res) => {

    const id = req.params.id;

    db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {

        if (err || !product) return res.status(404).json({ error: "ไม่พบสินค้า" });

        db.all("SELECT * FROM categories", [], (err, categories) => {
            if (err) return res.status(500).json({ error: err.message });

            db.all("SELECT * FROM suppliers", [], (err, suppliers) => {
                if (err) return res.status(500).json({ error: err.message });

                res.json({ product, categories, suppliers });
            });
        });
    });
};


// ==========================
// เพิ่มสินค้า (API)
// ==========================
exports.addProduct = (req, res) => {

    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    let { name, brand, price, stock, category_id, supplier_id } = req.body;

    price = parseFloat(price);
    stock = parseInt(stock);
    category_id = category_id || null;
    supplier_id = supplier_id || null;

    if (!name || isNaN(price) || isNaN(stock) || stock < 0) {
        return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
    }

    const employeeId = req.session.user.employee_id;

    db.serialize(() => {

        db.run("BEGIN TRANSACTION");

        db.get(
            `SELECT * FROM products WHERE name = ? AND brand = ?`,
            [name, brand || null],
            (err, existingProduct) => {

                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err.message });
                }

                if (existingProduct) {

                    const newStock = existingProduct.stock + stock;
                    const totalPrice = price * stock;

                    db.run(
                        `UPDATE products SET stock = ?, price = ? WHERE id = ?`,
                        [newStock, price, existingProduct.id],
                        (err) => {

                            if (err) {
                                db.run("ROLLBACK");
                                return res.status(500).json({ error: err.message });
                            }

                            db.run(
                                `INSERT INTO transactions
                                 (product_id, employee_id, transaction_type, quantity, total_price)
                                 VALUES (?, ?, 'IN', ?, ?)`,
                                [existingProduct.id, employeeId, stock, totalPrice],
                                (err) => {

                                    if (err) {
                                        db.run("ROLLBACK");
                                        return res.status(500).json({ error: err.message });
                                    }

                                    db.run("COMMIT");
                                    return res.json({ success: true, updated: existingProduct.id, newStock });
                                }
                            );
                        }
                    );

                } else {

                    db.run(
                        `INSERT INTO products 
                        (name, brand, price, stock, category_id, supplier_id)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [name, brand || null, price, stock, category_id, supplier_id],
                        function (err) {

                            if (err) {
                                db.run("ROLLBACK");
                                return res.status(500).json({ error: err.message });
                            }

                            const productId = this.lastID;
                            const totalPrice = price * stock;

                            db.run(
                                `INSERT INTO transactions 
                                (product_id, employee_id, transaction_type, quantity, total_price)
                                VALUES (?, ?, 'IN', ?, ?)`,
                                [productId, employeeId, stock, totalPrice],
                                (err) => {

                                    if (err) {
                                        db.run("ROLLBACK");
                                        return res.status(500).json({ error: err.message });
                                    }

                                    db.run("COMMIT");
                                    return res.json({ success: true, created: productId });
                                }
                            );
                        }
                    );
                }
            }
        );
    });
};


// ==========================
// อัปเดตสินค้า (API)
// ==========================
exports.updateProduct = (req, res) => {

    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id;
    let { name, brand, price, stock, category_id, supplier_id } = req.body;

    price = parseFloat(price);
    stock = parseInt(stock);
    category_id = category_id || null;
    supplier_id = supplier_id || null;

    if (!name || isNaN(price) || isNaN(stock) || stock < 0) {
        return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
    }

    const employeeId = req.session.user.employee_id;

    db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {

        if (err) return res.status(500).json({ error: err.message });
        if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });

        const oldStock = product.stock;
        const diff = stock - oldStock;

        db.serialize(() => {

            db.run("BEGIN TRANSACTION");

            db.run(
                `UPDATE products
                 SET name=?, brand=?, price=?, stock=?, category_id=?, supplier_id=?
                 WHERE id=?`,
                [name, brand || null, price, stock, category_id, supplier_id, id],
                (err) => {

                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: err.message });
                    }

                    if (diff !== 0) {

                        const type = diff > 0 ? 'IN' : 'OUT';
                        const quantity = Math.abs(diff);
                        const totalPrice = price * quantity;

                        db.run(
                            `INSERT INTO transactions 
                            (product_id, employee_id, transaction_type, quantity, total_price)
                            VALUES (?, ?, ?, ?, ?)`,
                            [id, employeeId, type, quantity, totalPrice],
                            (err) => {

                                if (err) {
                                    db.run("ROLLBACK");
                                    return res.status(500).json({ error: err.message });
                                }

                                db.run("COMMIT");
                                return res.json({ success: true });
                            }
                        );

                    } else {

                        db.run("COMMIT");
                        return res.json({ success: true });

                    }

                }
            );
        });
    });
};


// ==========================
// ลบสินค้า (API)
// ==========================
exports.deleteProduct = (req, res) => {

    const id = req.params.id;

    db.run("DELETE FROM products WHERE id = ?", [id], function(err) {

        if (err) return res.status(500).json({ error: "ลบไม่สำเร็จ" });
        if (this.changes === 0) return res.status(404).json({ error: "ไม่พบสินค้า" });

        res.json({ success: true });
    });
};


// ==========================
// ขายสินค้า (API)
// ==========================
exports.sellProduct = (req, res) => {

    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id;
    const quantity = parseInt(req.body.quantity);

    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ error: "จำนวนไม่ถูกต้อง" });
    }

    const employeeId = req.session.user.employee_id;

    db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {

        if (err) return res.status(500).json({ error: err.message });
        if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });

        if (product.stock < quantity) {
            return res.status(400).json({ error: "สินค้าไม่พอ" });
        }

        const newStock = product.stock - quantity;
        const totalPrice = product.price * quantity;

        db.serialize(() => {

            db.run("BEGIN TRANSACTION");

            db.run(
                "UPDATE products SET stock = ? WHERE id = ?",
                [newStock, id],
                (err) => {

                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: "อัปเดตสต็อกไม่สำเร็จ" });
                    }

                    db.run(
                        `INSERT INTO transactions
                         (product_id, employee_id, transaction_type, quantity, total_price)
                         VALUES (?, ?, 'OUT', ?, ?)`,
                        [id, employeeId, quantity, totalPrice],
                        (err) => {

                            if (err) {
                                db.run("ROLLBACK");
                                return res.status(500).json({ error: "บันทึกธุรกรรมไม่สำเร็จ" });
                            }

                            db.run("COMMIT");
                            return res.json({ success: true, newStock });
                        }
                    );

                }
            );
        });
    });
};