const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

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
    // SUPPLIERS
    // ======================
    db.run(`
        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ======================
    // EMPLOYEES
    // ======================
    db.run(`
        CREATE TABLE IF NOT EXISTS employees (
            employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_name TEXT NOT NULL,
            position TEXT,
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
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            category_id INTEGER,
            supplier_id INTEGER,
            FOREIGN KEY (category_id) REFERENCES categories(id),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        )
    `);

    // ======================
    // TRANSACTIONS
    // ======================
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            employee_id INTEGER,
            transaction_type TEXT,
            quantity INTEGER NOT NULL,
            total_price REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        )
    `);

    // ======================
    // USERS LOGIN
    // ======================
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            employee_id INTEGER,
            FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
        )
    `);

    // ======================
    // DEFAULT DATA
    // ======================

    db.run(`INSERT OR IGNORE INTO categories (id,name) VALUES (1,'CPU')`);
    db.run(`INSERT OR IGNORE INTO categories (id,name) VALUES (2,'GPU')`);
    db.run(`INSERT OR IGNORE INTO categories (id,name) VALUES (3,'RAM')`);
    db.run(`INSERT OR IGNORE INTO categories (id,name) VALUES (4,'Storage')`);

    db.run(`
        INSERT OR IGNORE INTO suppliers (id,name,phone,email,address)
        VALUES (1,'JIB Supplier','0899999999','jib@mail.com','Bangkok')
    `);

    db.run(`
        INSERT OR IGNORE INTO employees (employee_id,employee_name,position,phone)
        VALUES (1,'Admin Employee','Manager','0800000000')
    `);

    db.run(`
        INSERT OR IGNORE INTO employees (employee_id,employee_name,position,phone)
        VALUES (2,'Staff Employee','Staff','0811111111')
    `);

    // ======================
    // CREATE LOGIN USER
    // ======================

    const adminPass = await bcrypt.hash('1234',10);
    const userPass = await bcrypt.hash('1234',10);

    db.run(`
        INSERT OR IGNORE INTO users (username,password,role,employee_id)
        VALUES (?,?,?,?)
    `,['admin',adminPass,'admin',1]);

    db.run(`
        INSERT OR IGNORE INTO users (username,password,role,employee_id)
        VALUES (?,?,?,?)
    `,['user',userPass,'user',2]);

    console.log("Database initialized successfully");

});

module.exports = db;