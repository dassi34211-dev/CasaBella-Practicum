//מגדיר את מבנה המפה במונגו ואת בדיקות התקינות של Joi :

const mongoose = require('mongoose');
const Joi = require('joi');

// 1. הגדרת הסכמה (המבנה) של מסד הנתונים בעזרת Mongoose
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String }, // הקישור לתמונה שיעלה
    shape: { 
        type: String, 
        enum: ['מלבן', 'עגול', 'ריבוע', 'אליפסה'], // מגביל לאפשרויות האלו בלבד
        default: 'מלבן'
    },
    material: { type: String }, // למשל: פשתן, כותנה
    inStock: { type: Boolean, default: true } // האם קיים במלאי (ברירת מחדל: כן)
}, { 
    timestamps: true // יוסיף אוטומטית תאריך יצירה ותאריך עדכון לכל מפה
});

// יצירת המודל מתוך הסכמה
const Product = mongoose.model('Product', productSchema);

// 2. פונקציה לבדיקת תקינות הנתונים (Validation) בעזרת Joi
// נשתמש בזה כשמנהל ינסה להוסיף מפה חדשה, כדי לוודא שהוא לא הכניס נתונים שגויים
const validateProduct = (product) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(1000).allow(''),
        price: Joi.number().min(0).required(), // המחיר חייב להיות 0 או יותר
        image: Joi.string().allow(''),
        shape: Joi.string().valid('מלבן', 'עגול', 'ריבוע', 'אליפסה'),
        material: Joi.string().max(100).allow(''),
        inStock: Joi.boolean()
    });
    return schema.validate(product);
};

// ייצוא המודל ופונקציית הוולידציה כדי שנוכל להשתמש בהם בקונטרולר
module.exports = { Product, validateProduct };