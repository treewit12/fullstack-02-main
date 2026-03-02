const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// แสดงทั้งหมด
router.get('/', supplierController.getSuppliers);

// หน้าเพิ่ม
router.get('/add', supplierController.addForm);

// เพิ่ม
router.post('/add', supplierController.addSupplier);

// หน้าแก้ไข
router.get('/edit/:id', supplierController.editForm);

// อัปเดต
router.post('/update/:id', supplierController.updateSupplier);

// ลบ
router.get('/delete/:id', supplierController.deleteSupplier);

module.exports = router;