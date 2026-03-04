const db = require('./src/db');
const bcrypt = require('bcrypt');

db.serialize(async () => {

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
    // EMPLOYEES
    // ======================
    db.run(`
        CREATE TABLE IF NOT EXISTS employees (
            employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_name TEXT NOT NULL,
            position TEXT NOT NULL,
            phone TEXT NOT NULL
        )
    `);

    // ======================
    // SUPPLIERS (เพิ่มใหม่)
    // ======================
    db.run(`
        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact TEXT,
            phone TEXT
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
    // TRANSACTIONS (เพิ่ม supplier_id)
    // ======================
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            employee_id INTEGER,
            supplier_id INTEGER,
            transaction_type TEXT,
            quantity INTEGER,
            total_price REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(product_id) REFERENCES products(id),
            FOREIGN KEY(employee_id) REFERENCES employees(employee_id),
            FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
        )
    `);

    // ======================
    // USERS
    // ======================
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            employee_id INTEGER,
            role TEXT DEFAULT 'user',
            FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
        )
    `);

    // ======================
    // DEFAULT DATA
    // ======================

    db.run(`INSERT OR IGNORE INTO categories (id, name) VALUES (1, 'CPU')`);
    db.run(`INSERT OR IGNORE INTO categories (id, name) VALUES (2, 'GPU')`);
    db.run(`INSERT OR IGNORE INTO categories (id, name) VALUES (3, 'RAM')`);
    db.run(`INSERT OR IGNORE INTO categories (id, name) VALUES (4, 'Storage')`);

    // เพิ่ม Supplier ตัวอย่าง
    db.run(`
        INSERT OR IGNORE INTO suppliers (id, name, contact, phone)
        VALUES (1, 'JIB Supplier', 'Somchai', '0899999999')
    `);

    // เพิ่ม Employee ตัวอย่าง
    db.run(`
        INSERT OR IGNORE INTO employees (employee_id, employee_name, position, phone)
        VALUES (1, 'Admin Employee', 'Manager', '0800000000')
    `);

    // ======================
    // CREATE DEFAULT ADMIN USER
    // ======================

    const hashedPassword = await bcrypt.hash('1234', 10);

    db.run(`
        INSERT OR IGNORE INTO users (username, password, employee_id, role)
        VALUES (?, ?, ?, ?)
    `, ['admin', hashedPassword, 1, 'admin']);

    console.log("Database initialized successfully with supplier support");
});

console.log("Init database เสร็จแล้ว");