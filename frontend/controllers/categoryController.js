const axios = require('axios');
const API = 'http://localhost:3000';
function configWithCookies(req) {
  return { headers: { cookie: req.headers.cookie || '' }, withCredentials: true };
}

exports.getCategories = async (req, res) => {
  try {
    const resp = await axios.get(`${API}/categories`, configWithCookies(req));
    const categories = resp.data.categories || [];
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

    const resp = await axios.post(
      `${API}/categories`,
      { name },
      configWithCookies(req)
    );

    res.redirect('/categories');
  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.error || "Error creating category";
    res.send(msg);
  }
};