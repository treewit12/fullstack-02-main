const axios = require('axios');
const API = 'http://localhost:3000';
function configWithCookies(req) {
  return { headers: { cookie: req.headers.cookie || '' }, withCredentials: true };
}

// ==========================
// แสดงสินค้า
// ==========================
exports.getProducts = async (req, res) => {
  try {
    const resp = await axios.get(`${API}/products`, configWithCookies(req));
    const { products, categories, suppliers } = resp.data;
    res.render('products', { products, categories, suppliers, currentPage: 'products' });
  } catch (err) {
    console.error(err);
    res.send(err.response?.data?.error || err.message);
  }
};

// ==========================
// ฟอร์มแก้ไขสินค้า
// ==========================
exports.editForm = async (req, res) => {
    const id = req.params.id;
    try {
        const resp = await axios.get(`${API}/products/edit/${id}`, configWithCookies(req));
        const { product, categories, suppliers } = resp.data;
        res.render('editProduct', { product, categories, suppliers });
    } catch (err) {
        console.error(err);
        res.send(err.response?.data?.error || 'ไม่พบสินค้า');
    }
};


// ==========================
// เพิ่มสินค้า
// ==========================
exports.addProduct = async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    let { name, brand, price, stock, category_id, supplier_id } = req.body;
    price = parseFloat(price);
    stock = parseInt(stock);
    category_id = category_id || null;
    supplier_id = supplier_id || null;

    if (!name || isNaN(price) || isNaN(stock) || stock < 0) {
        return res.send("ข้อมูลไม่ถูกต้อง");
    }

    try {
        await axios.post(
            `${API}/products`,
            { name, brand, price, stock, category_id, supplier_id },
            configWithCookies(req)
        );
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.send(err.response?.data?.error || err.message);
    }
};


// ==========================
// อัปเดตสินค้า
// ==========================
exports.updateProduct = async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const id = req.params.id;
    const { name, brand, price, stock, category_id, supplier_id } = req.body;

    try {
        await axios.post(
            `${API}/products/update/${id}`,
            { name, brand, price, stock, category_id, supplier_id },
            configWithCookies(req)
        );
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.send(err.response?.data?.error || err.message);
    }
};


// ==========================
// ลบสินค้า
// ==========================
exports.deleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        await axios.delete(`${API}/products/${id}`, configWithCookies(req));
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.send(err.response?.data?.error || "ลบไม่สำเร็จ");
    }
};


// ==========================
// ขายสินค้า
// ==========================
exports.sellProduct = async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const id = req.params.id;
    const quantity = parseInt(req.body.quantity);

    if (isNaN(quantity) || quantity <= 0) {
        return res.send("จำนวนไม่ถูกต้อง");
    }

    try {
        await axios.post(
            `${API}/products/sell/${id}`,
            { quantity },
            configWithCookies(req)
        );
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.send(err.response?.data?.error || err.message);
    }
};