// ייבוא ספריות הליבה של השרת
const express = require('express'); // הספרייה הראשית ליצירת שרת ה-Node
const cors = require('cors'); // מאפשר ל-React (שיושב בפורט 3000) לדבר עם ה-Node (שיושב בפורט 5000)
const dotenv = require('dotenv'); // מאפשר לקרוא נתונים רגישים מקובץ ה-.env
const connectDB = require('./config/db'); // ייבוא פונקציית החיבור למסד הנתונים מונגו

// ייבוא הראוטרים (המלצרים) - כל אחד אחראי על אזור אחר באתר
const productRouter = require('./routes/product.route'); // ניהול המפות (המוצרים)
const userRouter = require('./routes/user.route');       // ניהול המשתמשים (הרשמה/התחברות)
const orderRouter = require('./routes/order.route');     // חדש! ניהול ההזמנות (Checkout)
const assistantRouter = require('./routes/assistant.route');


// טעינת משתני הסביבה (כמו כתובת ה-DB והסיסמאות) לתוך הזיכרון של השרת
dotenv.config();

// הפעלת החיבור בפועל למסד הנתונים MongoDB Atlas/Local
connectDB(); 

// יצירת מופע של האפליקציה (השרת)
const app = express();

// --- Middlewares (פונקציות ביניים שכל בקשה עוברת דרכן) ---

// מאפשר גישה ממקורות זרים (CORS)
app.use(cors()); 

// מאפשר לשרת להבין נתונים שנשלחים אליו בפורמט JSON (כמו הנתונים מהטפסים בריאקט)
app.use(express.json()); 

// חשיפת תיקיית התמונות: מאפשר ל-React להציג תמונות שנמצאות בתיקיית uploads בשרת
app.use('/uploads', express.static('uploads'));

// --- הגדרת נתיבי ה-API (Routing) ---

// כל פנייה שמתחילה ב- /api/products תעבור לטיפול של productRouter
app.use('/api/products', productRouter);

// כל פנייה שמתחילה ב- /api/users תעבור לטיפול של userRouter
app.use('/api/users', userRouter);

// *** חדש! *** כל פנייה שמתחילה ב- /api/orders תעבור לטיפול של orderRouter
// זה הנתיב שבו נשמור את הקניות של הלקוחות
app.use('/api/orders', orderRouter);

app.use('/api/assistant', assistantRouter);


// נתיב בדיקה כללי (Root) - כדי לוודא שהשרת באוויר
app.get('/', (req, res) => {
    res.send('ברוכים הבאים לשרת של CasaBella! הכל עובד תקין 🚀');
});

app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ message: status < 500 ? err.message : 'שגיאת שרת' });
});

// הגדרת הפורט (יציאה): לוקח מה-.env או משתמש ב-5000 כברירת מחדל
const PORT = process.env.PORT || 5000;

// הפעלת השרת והאזנה לבקשות נכנסות
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`📡 Ready to receive orders and maps!`);
});