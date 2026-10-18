const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // מנסה להתחבר למסד הנתונים בעזרת הכתובת מקובץ ה-.env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // עוצר את השרת אם יש שגיאת חיבור קריטית
    }
};

module.exports = connectDB;