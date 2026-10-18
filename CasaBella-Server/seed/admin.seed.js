// הרצה: node seed/admin.seed.js
// יוצר (או מאפס) משתמשת מנהלת לפי ADMIN_EMAIL ו-ADMIN_PASSWORD מקובץ ה-.env
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../models/user.model');

const run = async () => {
    const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file');
    }

    await mongoose.connect(MONGO_URI);

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // אם המשתמשת קיימת - מעדכנים אותה למנהלת, אחרת יוצרים חדשה
    await User.findOneAndUpdate(
        { email: ADMIN_EMAIL },
        { $set: { name: 'Admin', email: ADMIN_EMAIL, password, isAdmin: true } },
        { upsert: true }
    );

    console.log(`✅ Admin ready: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error('❌ Admin seed failed:', err.message);
    process.exit(1);
});