const { User, validateUser, validateLogin } = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// הרשמת משתמש חדש
const register = async (req, res) => {
    try {
        const { error } = validateUser(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).json({ message: "המשתמש כבר רשום במערכת" });

        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        await user.save();

        // --- תיקון: עכשיו גם בהרשמה אנחנו מייצרים טוקן (עם השם!) ---
        const token = jwt.sign(
            { _id: user._id, name: user.name, isAdmin: false },
            process.env.JWT_SECRET
        );

        // שולחים לריאקט את הטוקן כדי שיחבר את המשתמש מיד
        res.header('x-auth-token', token).status(201).json({
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: false
            }
        });
    } catch (error) {
        res.status(500).json({ message: "שגיאה ברישום משתמש", error: error.message });
    }
};

// התחברות משתמש קיים
const login = async (req, res) => {
    try {
        const { error } = validateLogin(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ message: "אימייל או סיסמה שגויים" });

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ message: "אימייל או סיסמה שגויים" });

        const isActuallyAdmin = user.isAdmin;
        // --- תיקון: הוספנו את השם (name: user.name) לתוך הטוקן! ---
        const token = jwt.sign(
            { _id: user._id, name: user.name, isAdmin: isActuallyAdmin },
            process.env.JWT_SECRET

        );

        res.header('x-auth-token', token).json({
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: isActuallyAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: "שגיאה בהתחברות", error: error.message });
    }
};

// ייצוא הפונקציות - חשוב מאוד!
module.exports = { register, login };