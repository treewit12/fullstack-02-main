const db = require('../src/db');


// ==========================
// แสดงสินค้า
// ==========================
exports.getProducts = (req, res) => {

    const sql = `
        SELECT products.*, categories.name AS category_name
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
        ORDER BY products.id DESC
    `;

    db.all(sql, [], (err, products) => {
        if (err) return res.send("Database error (products)");

        db.all("SELECT * FROM categories", [], (err, categories) => {
            if (err) return res.send("Database error (categories)");

            res.render('products', { 
                products, 
                categories,
                currentPage: 'products'
            });
        });
    });
};



// ==========================
// เพิ่มสินค้า (บันทึก IN อัตโนมัติ)
// ==========================
exports.addProduct = (req, res) => {

    let { name, brand, price, stock, category_id } = req.body;

    price = parseFloat(price);
    stock = parseInt(stock);
    category_id = category_id || null;

    if (!name || isNaN(price) || isNaN(stock) || stock < 0) {
        return res.send("ข้อมูลไม่ถูกต้อง");
    }

    db.serialize(() => {

        db.run("BEGIN TRANSACTION");

        db.run(
            `INSERT INTO products (name, brand, price, stock, category_id)
             VALUES (?, ?, ?, ?, ?)`,
            [name, brand || null, price, stock, category_id],
            function (err) {

                if (err) {
                    db.run("ROLLBACK");
                    return res.send(err.message);
                }

                const productId = this.lastID;

                if (stock > 0) {
                    const totalPrice = price * stock;

                    db.run(
                        `INSERT INTO transactions 
                        (product_id, transaction_type, quantity, total_price)
                        VALUES (?, 'IN', ?, ?)`,
                        [productId, stock, totalPrice],
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
};



// ==========================
// ฟอร์มแก้ไขสินค้า
// ==========================
exports.editForm = (req, res) => {

    const id = req.params.id;

    db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {

        if (err || !product) {
            return res.send("ไม่พบสินค้า");
        }

        db.all("SELECT * FROM categories", [], (err, categories) => {

            if (err) return res.send("Database error");

            res.render('editProduct', { 
                product, 
                categories,
                currentPage: 'products'
            });
        });
    });
};



// ==========================
// อัปเดตสินค้า (ตรวจความต่าง stock)
// ==========================
exports.updateProduct = (req, res) => {

    const id = req.params.id;
    let { name, brand, price, stock, category_id } = req.body;

    price = parseFloat(price);
    stock = parseInt(stock);
    category_id = category_id || null;

    if (!name || isNaN(price) || isNaN(stock) || stock < 0) {
        return res.send("ข้อมูลไม่ถูกต้อง");
    }

    db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {

        if (err || !product) return res.send("ไม่พบสินค้า");

        const oldStock = product.stock;
        const diff = stock - oldStock;

        db.serialize(() => {

            db.run("BEGIN TRANSACTION");

            db.run(
                `UPDATE products
                 SET name=?, brand=?, price=?, stock=?, category_id=?
                 WHERE id=?`,
                [name, brand || null, price, stock, category_id, id],
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
                            (product_id, transaction_type, quantity, total_price)
                            VALUES (?, ?, ?, ?)`,
                            [id, type, quantity, totalPrice],
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
        if (err) return res.send(err.message);
        res.redirect('/products');
    });
};



// ==========================
// ขายสินค้า (ลด stock + บันทึก OUT)
// ==========================
exports.sellProduct = (req, res) => {

    const id = req.params.id;
    const quantity = parseInt(req.body.quantity);

    if (!quantity || quantity <= 0) {
        return res.send("จำนวนไม่ถูกต้อง");
    }

    db.get("SELECT * FROM products WHERE id = ?", [id], (err, product) => {

        if (err || !product) return res.send("ไม่พบสินค้า");

        if (product.stock < quantity) {
            return res.send("Stock ไม่พอ");
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
                        return res.send(err.message);
                    }

                    db.run(
                        `INSERT INTO transactions 
                        (product_id, transaction_type, quantity, total_price)
                        VALUES (?, 'OUT', ?, ?)`,
                        [id, quantity, totalPrice],
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

        });

    });
};