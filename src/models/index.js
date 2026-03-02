const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const Category = require('./Category')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const Transaction = require('./Transaction')(sequelize, DataTypes);

// Relationships
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

Product.hasMany(Transaction, { foreignKey: 'product_id' });
Transaction.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = { sequelize, Category, Product, Transaction };