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
            position TEXT,
            phone TEXT
        )
    `);

    // ======================
    // SUPPLIERS
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
            product_id INTEGER,
            employee_id INTEGER,
            transaction_type TEXT,
            quantity INTEGER,
            total_price REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(product_id) REFERENCES products(id),
            FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
        )
    `);

    // ======================
    // USERS (LOGIN)
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
        INSERT OR IGNORE INTO suppliers (id,name,contact,phone)
        VALUES (1,'JIB Supplier','Somchai','0899999999')
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
    // PASSWORD HASH
    // ======================

    const adminPass = await bcrypt.hash('1234',10);
    const userPass = await bcrypt.hash('1234',10);

    db.run(`
        INSERT OR IGNORE INTO users (username,password,employee_id,role)
        VALUES (?,?,?,?)
    `,['admin',adminPass,1,'admin']);

    db.run(`
        INSERT OR IGNORE INTO users (username,password,employee_id,role)
        VALUES (?,?,?,?)
    `,['user',userPass,2,'user']);

    console.log("Database initialized successfully");

});

console.log("Init database เสร็จแล้ว");