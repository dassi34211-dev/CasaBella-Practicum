import { useState, useEffect } from 'react';
// ייבוא פונקציות מרידאקס כדי לדבר עם ה-Store הגלובלי של האפליקציה
import { useDispatch, useSelector } from 'react-redux';
// useParams: מושך נתונים מהכתובת (למשל ה-ID של המוצר). useNavigate: מנווט אותנו לעמוד אחר.
import { useParams, useNavigate } from 'react-router-dom';
// הפעולות האסינכרוניות שלנו שניגשות לשרת (להוסיף או לעדכן מוצר)
import { addProductAsync, updateProductAsync } from './productSlice';
// רכיבי עיצוב מוכנים מ-Material UI
import { Button, TextField, Box, Typography, Container, Alert } from '@mui/material';

// --- הייבוא של react-hook-form (דרישת בונוס/המלצה בפרויקט!) ---
// הספרייה הזו מנהלת את הטופס, בודקת תקינות (ולידציה) וחוסכת לנו המון קוד
import { useForm } from 'react-hook-form';

export default function AddProduct() {
  // 1. הגדרת כלי העבודה הבסיסיים
  const { id } = useParams(); // לוכד את ה-ID משורת הכתובת. אם אין ID, אנחנו במצב "הוספה"
  const navigate = useNavigate(); // פונקציה למעבר בין דפים
  const dispatch = useDispatch(); // פונקציה לשיגור בקשות לרידאקס

  // 2. זיהוי המצב: האם אנחנו עורכים מוצר קיים? (אם יש ID בכתובת, הערך יהיה true)
  const isEdit = Boolean(id);

  // 3. שליפת הנתונים מהמוח המרכזי (Redux)
  // מושכים את המוצר הספציפי שאנחנו רוצים לערוך (לפי ה-ID)
  const productToEdit = useSelector((state) =>
    state.products.items.find((p) => p._id === id)
  );
  // מושכים את הטוקן של המנהלת כדי שהשרת יאשר לנו לבצע את הפעולה
  const token = useSelector((state) => state.auth.token);

  // 4. הגדרת react-hook-form - המנוע של הטופס שלנו
  const { 
    register, // פונקציה שמחברת שדה קלט (TextField) לספרייה כדי שהיא תעקוב אחריו
    handleSubmit, // פונקציה שעוטפת את שליחת הטופס שלנו ומוודאת שאין שגיאות לפני השליחה
    formState: { errors }, // אובייקט שמכיל את כל השגיאות (למשל: מחיר שלילי, שם ריק)
    setValue // פונקציה שמאפשרת לנו לשתול ערכים בתוך הטופס דרך הקוד (שימושי לעריכה)
  } = useForm({
    defaultValues: { name: '', price: '' } // ערכי ברירת מחדל ריקים בהתחלה
  });

  // 5. משתנים (States) לניהול התמונה והשגיאות הכלליות
  const [image, setImage] = useState(null); // שומר את קובץ התמונה הפיזי שהמשתמש העלה
  const [preview, setPreview] = useState(null); // שומר קישור מקומי כדי להציג את התמונה על המסך
  const [submitError, setSubmitError] = useState(null); // שומר הודעות שגיאה שמגיעות מהשרת (למשל: שרת נפל)

  // 6. מילוי אוטומטי של הטופס כשנכנסים למצב "עריכה"
  // ה-useEffect רץ בכל פעם שהרכיב נטען, או כשהמשתנים בתוך הסוגריים המרובעים למטה משתנים
  useEffect(() => {
    // אם אנחנו במצב עריכה והמוצר נטען בהצלחה מרידאקס
    if (isEdit && productToEdit) {
      // אנחנו משתמשים ב-setValue של הספרייה כדי למלא את השדות בשם ובמחיר הישנים
      setValue('name', productToEdit.name);
      setValue('price', productToEdit.price);
      
      // אם למוצר כבר יש תמונה בשרת, ניצור לה קישור כדי להציג אותה בתצוגה המקדימה
      if (productToEdit.image) {
        setPreview(`http://localhost:5000/${productToEdit.image}`);
      }
    }
  }, [isEdit, productToEdit, setValue]);

  // 7. פונקציה שמטפלת ברגע שהמשתמש בוחר תמונה מהמחשב
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // תופסים את הקובץ הראשון שנבחר
    if (file) {
      setImage(file); // שומרים את הקובץ המקורי כדי לשלוח לשרת אחר כך
      setPreview(URL.createObjectURL(file)); // יוצרים URL זמני כדי שהדפדפן יוכל להציג את התמונה מיד
    }
  };

  // 8. הפונקציה שמופעלת כשלוחצים על כפתור "שמור/הוסף" והטופס תקין
  // הנתונים (data) מגיעים אוטומטית מ-react-hook-form
  const onSubmitForm = async (data) => {
    try {
      setSubmitError(null); // מאפסים שגיאות קודמות לפני ניסיון חדש

      // יצירת אובייקט FormData - חובה כששולחים קבצים (כמו תמונות) לשרת, אי אפשר לשלוח כ-JSON רגיל
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('price', data.price);
      
      // בודקים אם המשתמש העלה תמונה חדשה
      if (image) {
        formData.append('image', image);
      } else if (!isEdit) {
         // בדיקת תקינות נוספת שלנו: אם זה מוצר חדש לגמרי, חובה להעלות תמונה!
         setSubmitError("חובה להעלות תמונה למוצר חדש");
         return; // עוצרים את הפונקציה ולא שולחים לשרת
      }

      // שליחה לשרת בהתאם למצב (עריכה או הוספה)
      if (isEdit) {
        // unwrap() גורם לזה שאם השרת החזיר שגיאה, נגיע ישר ל-catch למטה
        await dispatch(updateProductAsync({ id, formData, token })).unwrap();
      } else {
        await dispatch(addProductAsync({ formData, token })).unwrap();
      }
      
      // הכל עבר בהצלחה? נחזור לדף הבית!
      navigate('/');
    } catch (err) {
      // במקרה של שגיאה בבקשה, נציג אותה למשתמש
      setSubmitError(err.message || 'אירעה שגיאה בשמירת המוצר');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, p: 4, boxShadow: 3, borderRadius: '20px', bgcolor: 'white' }}>
        
        {/* כותרת דינמית: משתנה לפי מצב (הוספה/עריכה) */}
        <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', color: '#1a3761', mb: 3 }}>
          {isEdit ? 'עריכת מפה ✏️' : 'הוספת מפה חדשה 🏠'}
        </Typography>

        {/* הצגת שגיאה כללית (אם יש כזו, למשל אם שכחנו תמונה בהוספה) */}
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        {/* הטופס. שימי לב: onSubmit מפעיל את handleSubmit של הספרייה.
          היא קודם כל בודקת שאין שגיאות (שהשם ארוך מספיק, שיש מחיר),
          ורק אם הכל תקין, היא מפעילה את הפונקציה שלנו onSubmitForm 
        */}
        <form onSubmit={handleSubmit(onSubmitForm)}>
          
          <TextField 
            fullWidth 
            label="שם המוצר" 
            margin="normal" 
            // מחברים את השדה לספרייה בעזרת פונקציית register, ומגדירים כללי תקינות (ולידציה)
            {...register('name', { 
              required: 'שם המוצר הוא שדה חובה', // חייבים למלא
              minLength: { value: 3, message: 'השם חייב להכיל לפחות 3 תווים' } // אורך מינימלי
            })}
            // אם יש שגיאה בשדה 'name', השדה ייצבע באדום
            error={!!errors.name}
            // מציג את טקסט השגיאה (למשל: "השם חייב להכיל לפחות 3 תווים") מתחת לשדה
            helperText={errors.name?.message}
          />
          
          <TextField 
            fullWidth 
            label="מחיר (₪)" 
            type="number" 
            margin="normal" 
            // חיבור השדה והגדרת כללים למחיר
            {...register('price', { 
              required: 'מחיר הוא שדה חובה',
              min: { value: 1, message: 'המחיר חייב להיות גדול מ-0' } // אי אפשר להכניס מינוס או אפס
            })}
            error={!!errors.price}
            helperText={errors.price?.message}
          />

          {/* אזור העלאת התמונה */}
          <Box sx={{ mt: 3, mb: 2, p: 2, border: '1px dashed #ccc', borderRadius: '10px', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
              {isEdit ? 'החלפת תמונה (אופציונלי):' : 'בחירת תמונה (חובה):'}
            </Typography>
            {/* שדה הקלט לבחירת קובץ. onChange מפעיל את פונקציית התצוגה המקדימה שלנו */}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </Box>

          {/* אם יש קישור לתצוגה מקדימה (preview), נציג את התמונה על המסך */}
          {preview && (
            <Box sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
              <img 
                src={preview} 
                alt="תצוגה מקדימה" 
                style={{ maxWidth: '100%', height: '200px', objectFit: 'cover', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
              />
            </Box>
          )}

          {/* כפתור השמירה. הטקסט משתנה לפי המצב */}
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ mt: 2, py: 1.5, bgcolor: '#5d4037', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', '&:hover': { bgcolor: '#3e2723' } }}
          >
            {isEdit ? 'שמור שינויים' : 'הוסף מפה למלאי'}
          </Button>
          
        </form>
      </Box>
    </Container>
  );
}