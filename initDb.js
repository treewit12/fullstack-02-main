const db = require('./src/db');

db.serialize(() => {

    // ======================
    // CATEGORIES
    // ======================
    db.run(`
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )
    `);

    // ======================
    // PRODUCTS
    // ======================
    db.run(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT,
        price REAL,
        stock INTEGER,
        category_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories(id)
    )
    `);

    // ======================
    // TRANSACTIONS (อัปเกรดแล้ว)
    // ======================
    db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        transaction_type TEXT,  -- IN / OUT
        quantity INTEGER,
        total_price REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id)
    )
    `);

    // ======================
    // DEFAULT CATEGORIES
    // ======================
    db.run(`INSERT OR IGNORE INTO categories (id, name) VALUES (1, 'CPU')`);
    db.run(`INSERT OR IGNORE INTO categories (id, name) VALUES (2, 'GPU')`);
    db.run(`INSERT OR IGNORE INTO categories (id, name) VALUES (3, 'RAM')`);
    db.run(`INSERT OR IGNORE INTO categories (id, name) VALUES (4, 'Storage')`);

});

console.log("Init database เสร็จแล้ว");