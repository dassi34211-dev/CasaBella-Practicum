const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getAllOrders } = require('../controllers/order.controller');
const { auth, admin } = require('../middleware/auth'); // הוספנו את ה-admin middleware

// ראוט ליצירת הזמנה (כל משתמש מחובר)
router.post('/', auth, addOrderItems);

// ראוט להזמנות אישיות (כל משתמש מחובר)
router.get('/myorders', auth, getMyOrders);

// *** ראוט חדש למנהל! ***
// רק משתמש שהוא גם מחובר (auth) וגם מנהל (admin) יוכל לגשת לכאן
router.get('/', auth, admin, getAllOrders);

module.exports = router;