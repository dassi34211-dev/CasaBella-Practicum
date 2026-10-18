const multer = require('multer');
const path = require('path');

// הגדרת מקום האחסון ושם הקובץ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // שמירה בתיקייה שיצרנו
    },
    filename: function (req, file, cb) {
        // יוצר שם ייחודי: תאריך + שם הקובץ המקורי (כדי שלא יהיו כפילויות)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// בדיקה שזה באמת קובץ תמונה
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('נא להעלות קבצי תמונה בלבד!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;