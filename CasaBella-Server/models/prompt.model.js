const mongoose = require('mongoose');
const Joi = require('joi');

// כל בקשה שלקוחה שלחה ל-AI + התשובה שקיבלה (היסטוריית החיפושים)
const promptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    prompt: { type: String, required: true, trim: true, minlength: 5, maxlength: 500 },
    // ההסבר שה-AI כתב ללקוחה
    response: { type: String, required: true },
    // המוצרים שהומלצו. שימי לב: השם 'Product' חייב להיות זהה לשם המודל בקובץ של המוצרים
    recommendedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, {
    // רק created_at (בלי updated_at) כמו שמופיע בהוראות
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

const Prompt = mongoose.model('Prompt', promptSchema, 'prompts');

// בדיקת תקינות לבקשה שנשלחת מהלקוח
const validatePrompt = (body) => {
    const schema = Joi.object({
        categoryId: Joi.string().hex().length(24).required(),
        subCategoryId: Joi.string().hex().length(24).required(),
        prompt: Joi.string().trim().min(5).max(500).required()
    });
    return schema.validate(body);
};

module.exports = { Prompt, validatePrompt };