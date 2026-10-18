// ייבוא ספריית axios שמאפשרת לנו לשלוח בקשות רשת (HTTP) מהדפדפן לשרת שלנו
import axios from 'axios';

// הגדרת הכתובת הבסיסית של השרת שלנו (לוקח ממשתני סביבה או משתמש ב-localhost כברירת מחדל)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ייצוא פונקציה אסינכרונית בשם loginUser שמקבלת את פרטי המשתמש (אימייל וסיסמה מהטופס)
export const loginUser = async (userData) => {
    // התחלת בלוק try-catch לטיפול שגיאות נוח מול השרת
    try {
        // שליחת בקשת POST לכתובת ההתחברות של השרת עם הנתונים שהמשתמש הקליד
        const response = await axios.post(`${API_URL}/users/login`, userData);
        
        // החזרת הנתונים שקיבלנו מהשרת (הטוקן של ההתחברות) בחזרה לקומפוננטה שקראה לפונקציה
        return response.data;
        
    // תפיסת שגיאה במקרה שההתחברות נכשלה (למשל סיסמה שגויה או שרת למטה)
    } catch (error) {
        // זריקת השגיאה הלאה כדי שנוכל להציג הודעה מתאימה למשתמש בטופס
        throw error;
    }
};