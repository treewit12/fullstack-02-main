const { Category } = require('../src/models');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['id', 'DESC']]
    });

    // if client wants JSON (axios will set Accept header)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ categories });
    }

    res.render('categories', { categories });

  } catch (error) {
    console.error(error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ error: 'Error loading categories' });
    }
    res.send("Error loading categories");
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      return res.send("Category name is required");
    }

    // เช็คชื่อซ้ำ
    const existing = await Category.findOne({ where: { name } });

    if (existing) {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(409).json({ error: 'Category already exists' });
      }
      return res.send("Category already exists");
    }

    const category = await Category.create({ name });

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(201).json({ success: true, category });
    }

    res.redirect('/categories');

  } catch (error) {
    console.error(error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ error: 'Error creating category' });
    }
    res.send("Error creating category");
  }
};