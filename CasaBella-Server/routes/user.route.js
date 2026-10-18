const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/user.controller');

// נתיב להרשמה (POST) - /api/users/register
router.post('/register', register);
router.post('/login', login);

module.exports = router;