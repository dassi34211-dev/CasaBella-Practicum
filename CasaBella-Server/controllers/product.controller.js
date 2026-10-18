const { Product, validateProduct } = require('../models/product.model');

// 1. פעולת Read (GET) - שליפת כל המפות
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "שגיאה בשליפת הנתונים", error: error.message });
    }
};
// 2. פעולת Create (POST) - הוספת מפה חדשה עם תמונה
const addProduct = async (req, res) => {
    try {
        // א. אם עלתה תמונה דרך Multer, נכניס את הנתיב שלה לתוך גוף הבקשה
        if (req.file) {
            req.body.image = req.file.path;
        }

        // ב. בדיקת תקינות הנתונים בעזרת Joi
        const { error } = validateProduct(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // ג. יצירת המפה ושמירתה
        const newProduct = new Product(req.body);
        await newProduct.save();
        
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: "שגיאה בהוספת המוצר", error: error.message });
    }
};

// 3. פעולת Update (PUT) - עדכון מפה קיימת לפי ID
const updateProduct = async (req, res) => {
    try {
        // 1. אם העלו תמונה חדשה בעריכה, נוסיף אותה ל-body
        if (req.file) {
            req.body.image = req.file.path;
        }

        // 2. עדכון המוצר - כאן אנחנו משתמשים ב-$set כדי לעדכן רק מה שנשלח
        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true, runValidators: true }
        );

        if (!product) return res.status(404).json({ message: "המוצר לא נמצא" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "שגיאה בעדכון המוצר", error: error.message });
    }
};

// 4. פעולת Delete (DELETE) - מחיקת מפה לפי ID
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "המוצר לא נמצא" });
        res.json({ message: "המוצר נמחק בהצלחה", product });
    } catch (error) {
        res.status(500).json({ message: "שגיאה במחיקת המוצר", error: error.message });
    }
};

// ייצוא כל הפונקציות לשימוש בראוטר
module.exports = {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct
};