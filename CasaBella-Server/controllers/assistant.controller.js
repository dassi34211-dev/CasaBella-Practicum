const mongoose = require('mongoose');
const { Category } = require('../models/category.model');
const { SubCategory } = require('../models/subcategory.model');
const { Prompt, validatePrompt } = require('../models/prompt.model');
const { User } = require('../models/user.model');
// עובד גם אם המודל מיוצא כ-{ Product } וגם אם מיוצא ישירות
const productModule = require('../models/product.model');
const Product = productModule.Product || productModule;
const { recommendProducts } = require('../services/aiService');

// ה-id של המשתמשת מהטוקן (בדקי איך קראת לשדה כשיצרת את הטוקן)
const getUserId = (req) => req.user.id || req.user._id;

// שגיאות שאנחנו זרקנו בכוונה (עם status) מוצגות כמו שהן, כל השאר - הודעה כללית
const handleError = (res, err) => {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.status ? err.message : 'שגיאת שרת, נסי שוב מאוחר יותר'
    });
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/assistant/categories
exports.getCategories = async (req, res) => {
    try {
        res.json(await Category.find().sort('name'));
    } catch (err) {
        handleError(res, err);
    }
};

// GET /api/assistant/categories/:categoryId/sub-categories
exports.getSubCategories = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.categoryId)) {
            return res.status(400).json({ message: 'מזהה קטגוריה לא תקין' });
        }
        res.json(await SubCategory.find({ category: req.params.categoryId }).sort('name'));
    } catch (err) {
        handleError(res, err);
    }
};

// POST /api/assistant/prompts  (משתמשת מחוברת)
exports.submitPrompt = async (req, res) => {
    try {
        const { error, value } = validatePrompt(req.body);
        if (error) return res.status(400).json({ message: 'הנתונים שנשלחו אינם תקינים' });

        // מוודאים שתת-הקטגוריה באמת שייכת לקטגוריה שנבחרה
        const subCategory = await SubCategory
            .findOne({ _id: value.subCategoryId, category: value.categoryId })
            .populate('category', 'name');
        if (!subCategory) return res.status(404).json({ message: 'הקטגוריה או תת-הקטגוריה לא נמצאו' });

        const products = await Product.find().select('name price').lean();
        if (!products.length) return res.status(404).json({ message: 'אין כרגע מוצרים בחנות' });

        const { message, productIds } = await recommendProducts({
            category: subCategory.category.name,
            subCategory: subCategory.name,
            prompt: value.prompt,
            products
        });

        const saved = await Prompt.create({
            user: getUserId(req),
            category: value.categoryId,
            subCategory: value.subCategoryId,
            prompt: value.prompt,
            response: message,
            recommendedProducts: productIds
        });

        await saved.populate([
            { path: 'category', select: 'name' },
            { path: 'subCategory', select: 'name' },
            { path: 'recommendedProducts', select: 'name price image' }
        ]);
        res.status(201).json(saved);
    } catch (err) {
        handleError(res, err);
    }
};

// GET /api/assistant/prompts/me  (ההיסטוריה של המשתמשת המחוברת)
exports.getMyPrompts = async (req, res) => {
    try {
        const items = await Prompt.find({ user: getUserId(req) })
            .populate('category subCategory', 'name')
            .populate('recommendedProducts', 'name price image')
            .sort('-created_at')
            .limit(50);
        res.json(items);
    } catch (err) {
        handleError(res, err);
    }
};

// GET /api/assistant/admin/users?page=1&limit=10&search=...  (מנהלת בלבד)
exports.getUsersWithPrompts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
        const search = String(req.query.search || '').trim();

        // סינון לפי שם או אימייל (escapeRegex מונע מהמשתמש להזריק ביטוי רגולרי)
        const filter = {};
        if (search) {
            const regex = new RegExp(escapeRegex(search), 'i');
            filter.$or = [{ name: regex }, { email: regex }];
        }

        // select: בלי סיסמה!
        const [users, total] = await Promise.all([
            User.find(filter)
                .select('name email phone createdAt')
                .sort('-createdAt')
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User.countDocuments(filter)
        ]);

        const prompts = await Prompt.find({ user: { $in: users.map((u) => u._id) } })
            .populate('category subCategory', 'name')
            .sort('-created_at')
            .lean();

        // מקבצים את הבקשות לפי משתמשת
        const promptsByUser = new Map();
        for (const p of prompts) {
            const key = String(p.user);
            if (!promptsByUser.has(key)) promptsByUser.set(key, []);
            promptsByUser.get(key).push(p);
        }

        res.json({
            total,
            page,
            pages: Math.ceil(total / limit) || 1,
            users: users.map((u) => ({ ...u, prompts: promptsByUser.get(String(u._id)) || [] }))
        });
    } catch (err) {
        handleError(res, err);
    }
};