const { Category } = require('../models');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['id', 'DESC']]
    });

    res.render('categories', { categories });

  } catch (error) {
    console.error(error);
    res.send("Error loading categories");
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.send("Category name is required");
    }

    // เช็คชื่อซ้ำ
    const existing = await Category.findOne({ where: { name } });

    if (existing) {
      return res.send("Category already exists");
    }

    await Category.create({ name });

    res.redirect('/categories');

  } catch (error) {
    console.error(error);
    res.send("Error creating category");
  }
};