const axios = require('axios');
const API = 'http://localhost:3000';
function configWithCookies(req) {
  return { headers: { cookie: req.headers.cookie || '' }, withCredentials: true };
}

// แสดงรายการ
exports.getSuppliers = async (req, res) => {
    try {
        const resp = await axios.get(`${API}/suppliers`, configWithCookies(req));
        res.render('suppliers/index', { suppliers: resp.data.suppliers });
    } catch (err) {
        console.error(err);
        res.send(err.response?.data?.error || err.message);
    }
};

// หน้าเพิ่ม
exports.addForm = (req, res) => {
    res.render('suppliers/add');
};

// เพิ่ม
exports.addSupplier = async (req, res) => {
    const { name, phone, email, address } = req.body;
    try {
        await axios.post(
            `${API}/suppliers/add`,
            { name, phone, email, address },
            configWithCookies(req)
        );
        res.redirect('/suppliers');
    } catch (err) {
        console.error(err);
        res.send(err.response?.data?.error || err.message);
    }
};

// หน้าแก้ไข
exports.editForm = async (req, res) => {
    const { id } = req.params;
    try {
        const resp = await axios.get(`${API}/suppliers/edit/${id}`, configWithCookies(req));
        res.render('suppliers/edit', { supplier: resp.data.supplier });
    } catch (err) {
        console.error(err);
        res.send(err.response?.data?.error || err.message);
    }
};

// อัปเดต
exports.updateSupplier = async (req, res) => {
    const id = req.params.id;
    const { name, phone, email, address } = req.body;
    try {
        await axios.post(
            `${API}/suppliers/update/${id}`,
            { name, phone, email, address },
            configWithCookies(req)
        );
        res.redirect('/suppliers');
    } catch (err) {
        console.error(err);
        res.send(err.response?.data?.error || err.message);
    }
};

// ลบ
exports.deleteSupplier = async (req, res) => {
    const id = req.params.id;
    try {
        await axios.get(`${API}/suppliers/delete/${id}`, configWithCookies(req));
        res.redirect('/suppliers');
    } catch (err) {
        console.error(err);
        res.send(err.response?.data?.error || err.message);
    }
};