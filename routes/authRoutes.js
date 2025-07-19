// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

router.post('/login', loginUser); //  make sure loginUser is defined

module.exports = router;
