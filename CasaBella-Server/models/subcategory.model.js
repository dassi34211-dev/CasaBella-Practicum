const mongoose = require('mongoose');

// תת-קטגוריה, למשל "עגול" תחת "צורת השולחן"
const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 50 },
    // קשר לקטגוריה הראשית
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true }
});

// אותה תת-קטגוריה לא יכולה להופיע פעמיים באותה קטגוריה
subCategorySchema.index({ name: 1, category: 1 }, { unique: true });

const SubCategory = mongoose.model('SubCategory', subCategorySchema, 'sub_categories');

module.exports = { SubCategory };