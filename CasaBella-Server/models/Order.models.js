const mongoose = require('mongoose');

// הגדרת המבנה של פריט בודד בתוך ההזמנה
const orderItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    // קישור למודל המוצרים - מאפשר לנו לדעת איזה מוצר נרכש
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }
});

// הגדרת המבנה הכללי של ההזמנה
const orderSchema = new mongoose.Schema({
    // קישור למשתמש שביצע את ההזמנה - חשוב בשביל להציג ללקוח את היסטוריית ההזמנות שלו
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // מערך של פריטים (השתמשנו בסכימה שהגדרנו למעלה)
    orderItems: [orderItemSchema],
    // פרטי המשלוח שנלקחים מטופס ה-Checkout בריאקט
    shippingAddress: {
        fullName: { type: String, required: true },
        city: { type: String, required: true },
        street: { type: String, required: true },
        phone: { type: String, required: true }
    },
    // סכום סופי של העסקה כולל הכל
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    // סטטוס הזמנה (בונוס נחמד: מאפשר למנהלת לעדכן אם זה נשלח או בטיפול)
    status: {
        type: String,
        required: true,
        default: 'Pending' // ממתין לטיפול
    }
}, {
    // מוסיף אוטומטית שדות של createdAt ו-updatedAt (דרישה נפוצה בפרויקטים)
    timestamps: true
});

// יצירת המודל וייצוא שלו
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;