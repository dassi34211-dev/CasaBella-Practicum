const mongoose = require('mongoose');
const Joi = require('joi');

// הגדרת המבנה של המשתמש במסד הנתונים
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, minlength: 5, maxlength: 255 },
    password: { type: String, required: true, minlength: 6, maxlength: 1024 },
    phone: { type: String, trim: true, match: /^0\d{8,9}$/ },
    isAdmin: { type: Boolean, default: false } // ברירת מחדל - משתמש רגיל
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// פונקציית בדיקת תקינות להרשמה (Signup)
const validateUser = (user) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required(),
        phone: Joi.string().pattern(/^0\d{8,9}$/).allow('').messages({ 'string.pattern.base': 'מספר טלפון לא תקין' })
    });
    return schema.validate(user);
};

// פונקציית בדיקת תקינות להתחברות (Login)
const validateLogin = (req) => {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required()
    });
    return schema.validate(req);
};

module.exports = { User, validateUser, validateLogin };