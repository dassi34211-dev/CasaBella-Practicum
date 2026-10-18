const Order = require('../models/Order.models');

// פונקציה לשמירת הזמנה חדשה
const addOrderItems = async (req, res) => {
    try {
        const { orderItems, shippingAddress, totalPrice } = req.body;
        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'אין פריטים בהזמנה' });
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            totalPrice
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בשרת בעת יצירת ההזמנה', error: error.message });
    }
};

// מביאה רק את ההזמנות של המשתמש המחובר (עבור דף "ההזמנות שלי")
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בשליפת ההזמנות', error: error.message });
    }
};

// *** חדש למנהל! *** מביאה את כל ההזמנות של כל המשתמשים
const getAllOrders = async (req, res) => {
    try {
        // .populate('user', 'name email') - מושך גם את השם והאימייל של הלקוח מתיקיית המשתמשים
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בשליפת כל ההזמנות', error: error.message });
    }
};

module.exports = { addOrderItems, getMyOrders, getAllOrders };