const db = require('../db');

const Transaction = {
    create: (productId, quantity, callback) => {
        db.run(
            'INSERT INTO transactions (product_id, quantity) VALUES (?, ?)',
            [productId, quantity],
            callback
        );
    }
};

module.exports = Transaction;