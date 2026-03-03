const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// แสดงทั้งหมด
router.get('/', employeeController.getEmployees);

// หน้าเพิ่ม
router.get('/add', employeeController.showAddForm);

// บันทึกเพิ่ม
router.post('/create', employeeController.createEmployee);

// หน้าแก้ไข
router.get('/edit/:id', employeeController.showEditForm);

// บันทึกแก้ไข
router.post('/update/:id', employeeController.updateEmployee);

// ลบ
router.get('/delete/:id', employeeController.deleteEmployee);

module.exports = router;