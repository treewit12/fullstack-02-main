const axios = require('axios');
const API = 'http://localhost:3000';
function configWithCookies(req) {
  return { headers: { cookie: req.headers.cookie || '' }, withCredentials: true };
}

// ======================
// แสดงทั้งหมด
// ======================
exports.getEmployees = async (req, res) => {
  try {
    const resp = await axios.get(`${API}/employees`, configWithCookies(req));
    const employees = resp.data.employees || [];
    res.render('Employees', { employees });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.response?.data?.error || 'Database error');
  }
};

// ======================
// หน้าเพิ่ม
// ======================
exports.showAddForm = (req, res) => {
  res.render('addEmployee');
};

// ======================
// เพิ่มข้อมูล
// ======================
exports.createEmployee = async (req, res) => {
  const { employee_name, position, phone } = req.body;

  if (!employee_name || !position || !phone) {
    return res.status(400).send('กรอกข้อมูลไม่ครบ');
  }

  try {
    await axios.post(
      `${API}/employees/create`,
      { employee_name, position, phone },
      configWithCookies(req)
    );
    res.redirect('/employees');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.response?.data?.error || 'Insert error');
  }
};

// ======================
// หน้าแก้ไข
// ======================
exports.showEditForm = async (req, res) => {
  const id = req.params.id;
  try {
    const resp = await axios.get(`${API}/employees/edit/${id}`, configWithCookies(req));
    const employee = resp.data.employee;
    res.render('editEmployee', { employee });
  } catch (err) {
    console.error(err);
    res.status(err.response?.status || 500).send(err.response?.data?.error || 'Error');
  }
};

// ======================
// บันทึกแก้ไข
// ======================
exports.updateEmployee = async (req, res) => {
  const id = req.params.id;
  const { employee_name, position, phone } = req.body;

  if (!employee_name || !position || !phone) {
    return res.status(400).send('กรอกข้อมูลไม่ครบ');
  }

  try {
    await axios.post(
      `${API}/employees/update/${id}`,
      { employee_name, position, phone },
      configWithCookies(req)
    );
    res.redirect('/employees');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.response?.data?.error || 'Update error');
  }
};

// ======================
// ลบ
// ======================
exports.deleteEmployee = async (req, res) => {
  const id = req.params.id;
  try {
    // backend route is GET /employees/delete/:id
    await axios.get(`${API}/employees/delete/${id}`, configWithCookies(req));
    res.redirect('/employees');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.response?.data?.error || 'Delete error');
  }
};