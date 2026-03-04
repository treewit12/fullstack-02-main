const db = require('../src/db');


// ==========================
// แสดงสินค้า
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
        if (err) return res.send(err.message);

        db.all("SELECT * FROM categories", [], (err, categories) => {
            if (err) return res.send(err.message);

            db.all("SELECT * FROM suppliers", [], (err, suppliers) => {
                if (err) return res.send(err.message);

                res.render('products', { 
                    products, 
                    categories,
                    suppliers,
                    currentPage: 'products'
                });
            });
        });
    });
};


// ==========================
// ฟอร์มแก้ไขสินค้า
// ==========================
exports.editForm = (req, res) => {

    const id = req.params.id;

    db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {

        if (err || !product) return res.send("ไม่พบสินค้า");

        db.all("SELECT * FROM categories", [], (err, categories) => {

            db.all("SELECT * FROM suppliers", [], (err, suppliers) => {

                res.render('editProduct', {
                    product,
                    categories,
                    suppliers
                });

            });
        });
    });
};


// ==========================
// เพิ่มสินค้า
// ==========================
exports.addProduct = (req, res) => {

    if (!req.session.user) return res.redirect('/login');

    let { name, brand, price, stock, category_id, supplier_id } = req.body;

    price = parseFloat(price);
    stock = parseInt(stock);
    category_id = category_id || null;
    supplier_id = supplier_id || null;

    if (!name || isNaN(price) || isNaN(stock) || stock < 0) {
        return res.send("ข้อมูลไม่ถูกต้อง");
    }

    const employeeId = req.session.user.employee_id;

    db.serialize(() => {

        db.run("BEGIN TRANSACTION");

        // ✅ เช็คก่อนว่ามีสินค้าอยู่แล้วไหม
        db.get(
            `SELECT * FROM products WHERE name = ? AND brand = ?`,
            [name, brand || null],
            (err, existingProduct) => {

                if (err) {
                    db.run("ROLLBACK");
                    return res.send(err.message);
                }

                // ==========================
                // 🔥 ถ้ามีสินค้าอยู่แล้ว → เพิ่ม stock
                // ==========================
                if (existingProduct) {

                    const newStock = existingProduct.stock + stock;
                    const totalPrice = price * stock;

                    db.run(
                        `UPDATE products SET stock = ?, price = ? WHERE id = ?`,
                        [newStock, price, existingProduct.id],
                        (err) => {

                            if (err) {
                                db.run("ROLLBACK");
                                return res.send(err.message);
                            }

                            db.run(
                                `INSERT INTO transactions
                                 (product_id, employee_id, transaction_type, quantity, total_price)
                                 VALUES (?, ?, 'IN', ?, ?)`,
                                [existingProduct.id, employeeId, stock, totalPrice],
                                (err) => {

                                    if (err) {
                                        db.run("ROLLBACK");
                                        return res.send(err.message);
                                    }

                                    db.run("COMMIT");
                                    res.redirect('/products');
                                }
                            );
                        }
                    );

                } 
                // ==========================
                // ✅ ถ้ายังไม่มี → INSERT ใหม่
                // ==========================
                else {

                    db.run(
                        `INSERT INTO products 
                        (name, brand, price, stock, category_id, supplier_id)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [name, brand || null, price, stock, category_id, supplier_id],
                        function (err) {

                            if (err) {
                                db.run("ROLLBACK");
                                return res.send(err.message);
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
                                        return res.send(err.message);
                                    }

                                    db.run("COMMIT");
                                    res.redirect('/products');
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
// อัปเดตสินค้า
// ==========================
exports.updateProduct = (req, res) => {

    if (!req.session.user) return res.redirect('/login');

    const id = req.params.id;
    let { name, brand, price, stock, category_id, supplier_id } = req.body;

    price = parseFloat(price);
    stock = parseInt(stock);
    category_id = category_id || null;
    supplier_id = supplier_id || null;

    if (!name || isNaN(price) || isNaN(stock) || stock < 0) {
        return res.send("ข้อมูลไม่ถูกต้อง");
    }

    const employeeId = req.session.user.employee_id;

    db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {

        if (err || !product) return res.send("ไม่พบสินค้า");

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
                        return res.send(err.message);
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
                                    return res.send(err.message);
                                }

                                db.run("COMMIT");
                                res.redirect('/products');
                            }
                        );

                    } else {

                        db.run("COMMIT");
                        res.redirect('/products');

                    }

                }
            );
        });
    });
};


// ==========================
// ลบสินค้า
// ==========================
exports.deleteProduct = (req, res) => {

    const id = req.params.id;

    db.run("DELETE FROM products WHERE id = ?", [id], (err) => {

        if (err) return res.send("ลบไม่สำเร็จ");

        res.redirect('/products');
    });
};


// ==========================
// ขายสินค้า
// ==========================
exports.sellProduct = (req, res) => {

    if (!req.session.user) return res.redirect('/login');

    const id = req.params.id;
    const quantity = parseInt(req.body.quantity);

    if (isNaN(quantity) || quantity <= 0) {
        return res.send("จำนวนไม่ถูกต้อง");
    }

    const employeeId = req.session.user.employee_id;

    db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {

        if (err || !product) return res.send("ไม่พบสินค้า");

        if (product.stock < quantity) {
            return res.send("สินค้าไม่พอ");
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
                        return res.send("อัปเดตสต็อกไม่สำเร็จ");
                    }

                    db.run(
                        `INSERT INTO transactions
                         (product_id, employee_id, transaction_type, quantity, total_price)
                         VALUES (?, ?, 'OUT', ?, ?)`,
                        [id, employeeId, quantity, totalPrice],
                        (err) => {

                            if (err) {
                                db.run("ROLLBACK");
                                return res.send("บันทึกธุรกรรมไม่สำเร็จ");
                            }

                            db.run("COMMIT");
                            res.redirect('/products');
                        }
                    );

                }
            );
        });
    });
};