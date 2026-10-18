const express = require('express');
const router = express.Router();
const {
    getCategories,
    getSubCategories,
    submitPrompt,
    getMyPrompts,
    getUsersWithPrompts
} = require('../controllers/assistant.controller');
const { auth, admin } = require('../middleware/auth');

// פתוח לכולם: רשימת הקטגוריות ותתי-הקטגוריות
router.get('/categories', getCategories);
router.get('/categories/:categoryId/sub-categories', getSubCategories);

// משתמשת מחוברת: שליחת בקשה והיסטוריה אישית
router.post('/prompts', auth, submitPrompt);
router.get('/prompts/me', auth, getMyPrompts);

// מנהלת בלבד: כל המשתמשים וההיסטוריה שלהם
router.get('/admin/users', [auth, admin], getUsersWithPrompts);

module.exports = router;