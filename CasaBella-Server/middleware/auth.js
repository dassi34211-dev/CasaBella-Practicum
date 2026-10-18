const jwt = require('jsonwebtoken');

// מאבטח שבודק אם המשתמש בכלל מחובר (יש לו טוקן בתוקף)
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: "גישה נדחתה. אין טוקן." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET );
        req.user = decoded; // שומר את פרטי המשתמש בתוך הבקשה להמשך
        next(); // הכל בסדר, אפשר להמשיך לפונקציה הבאה
    } catch (ex) {
        res.status(400).json({ message: "טוקן לא תקין." });
    }
};

// מאבטח שבודק אם המשתמש הוא מנהל (Admin)
const admin = (req, res, next) => {
    // אם המשתמש מחובר אבל הוא לא מנהל - תעצור אותו!
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "גישה נדחתה. נדרשת הרשאת מנהל." });
    }
    next();
};
module.exports = { auth, admin };