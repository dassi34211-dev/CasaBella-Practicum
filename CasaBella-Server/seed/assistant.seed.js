// הרצה: node seed/assistant.seed.js
// מכניס קטגוריות ותתי-קטגוריות התחלתיות. בטוח להריץ כמה פעמים (לא יוצר כפילויות).
require('dotenv').config();
const mongoose = require('mongoose');
const { Category } = require('../models/category.model');
const { SubCategory } = require('../models/subcategory.model');

const data = {
    'צורת השולחן': ['עגול', 'מרובע'],
    'סוג אירוח': ['שבת וחג', 'ארוחה משפחתית', 'אירוח חגיגי'],
    'סגנון': ['כפרי ורך', 'מודרני', 'קלאסי ואלגנטי']
};

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    for (const [categoryName, subNames] of Object.entries(data)) {
        const category = await Category.findOneAndUpdate(
            { name: categoryName },
            { name: categoryName },
            { upsert: true, returnDocument: 'after' }
        );
        for (const subName of subNames) {
            await SubCategory.findOneAndUpdate(
                { name: subName, category: category._id },
                { name: subName, category: category._id },
                { upsert: true }
            );
        }
    }

    console.log('✅ Seed finished');
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});