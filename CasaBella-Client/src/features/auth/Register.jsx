import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
// נצטרך לייבא את פעולת ההרשמה מהרידאקס שלנו (נוודא שהיא קיימת בשלב הבא)
import { registerAsync } from './authSlice'; 
import { Button, TextField, Box, Typography, Container } from '@mui/material';

export default function Register() {
  // 1. הגדרת המשתנים לשדות הטופס
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // חדש: טלפון (לא חובה)
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 2. הפונקציה שמופעלת בלחיצה על "הרשמה"
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // שליחת הנתונים לפעולת ההרשמה ברידאקס (כולל הטלפון)
    const resultAction = await dispatch(registerAsync({ name, email, password, phone }));
    
    // אם ההרשמה עברה בהצלחה (fulfilled), נעביר את הלקוח לדף הבית
    if (registerAsync.fulfilled.match(resultAction)) {
      alert('הרשמה בוצעה בהצלחה! ברוך הבא לאתר.');
      navigate('/');
    } else {
      // אם הייתה שגיאה (למשל המייל כבר קיים)
      alert('שגיאה בהרשמה, ייתכן שהאימייל כבר קיים במערכת.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'white', textAlign: 'center' }}>
        
        <Typography variant="h4" gutterBottom sx={{ color: '#5d4037', fontWeight: 'bold' }}>
          הרשמה לאתר ✨
        </Typography>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          הצטרף אלינו כדי לרכוש מפות בקלות!
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField 
            fullWidth label="שם מלא" value={name} 
            onChange={(e) => setName(e.target.value)} 
            margin="normal" required 
          />
          <TextField 
            fullWidth label="אימייל" type="email" value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            margin="normal" required 
          />
          <TextField 
            fullWidth label="טלפון (לא חובה)" type="tel" value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            margin="normal" 
            slotProps={{ htmlInput: { pattern: '0[0-9]{8,9}', title: 'מספר טלפון ישראלי, למשל 0501234567' } }}
          />
          <TextField 
            fullWidth label="סיסמה" type="password" value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            margin="normal" required 
          />

          <Button 
            type="submit" fullWidth variant="contained" 
            sx={{ mt: 3, mb: 2, bgcolor: '#b18e6a', '&:hover': { bgcolor: '#8d6e63' }, py: 1.5, fontSize: '1.1rem' }}
          >
            צור חשבון
          </Button>
        </form>

        {/* קישור לעמוד התחברות למי שכבר יש לו חשבון */}
        <Typography variant="body2" sx={{ mt: 2 }}>
          כבר יש לך חשבון?{' '}
          <Link to="/login" style={{ color: '#b18e6a', textDecoration: 'none', fontWeight: 'bold' }}>
            התחבר כאן
          </Link>
        </Typography>

      </Box>
    </Container>
  );
}
