const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/', reportController.getUserPerformance);
router.get('/user-performance', reportController.getUserPerformance);

module.exports = router;