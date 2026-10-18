const express = require('express');
const router = express.Router();
const { 
    getAllProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/product.controller');
const { auth, admin } = require('../middleware/auth');
const upload = require('../middleware/upload'); // <--- 1. ייבוא ה-Middleware החדש כאן

// 1. קבלת כל המוצרים - פתוח לכולם
router.get('/', getAllProducts);

// 2. הוספת מוצר חדש עם תמונה - רק מנהל מחובר
// הוספנו את upload.single('image') לרשימת ה"מאבטחים"
router.post('/', [auth, admin, upload.single('image')], addProduct);

// 3. עדכון מוצר קיים (PUT) - הוספנו את המולטר כדי שיידע לקרוא את הנתונים החדשים
router.put('/:id', [auth, admin, upload.single('image')], updateProduct);
// 4. מחיקת מוצר (DELETE) - רק מנהל מחובר
router.delete('/:id', [auth, admin], deleteProduct);

module.exports = router;