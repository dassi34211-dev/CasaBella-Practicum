const mongoose = require('mongoose');

// קטגוריה ראשית לחיפוש, למשל "צורת השולחן" או "סגנון"
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true, maxlength: 50 }
});

// הפרמטר השלישי קובע את שם האוסף במסד הנתונים: categories
const Category = mongoose.model('Category', categorySchema, 'categories');

module.exports = { Category };