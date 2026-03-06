const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ======================
// LOGIN
// ======================
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// ======================
// REGISTER
// ======================
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

// ======================
// LOGOUT
// ======================
router.get('/logout', authController.logout);

module.exports = router;