import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
// ודאי שהשם של הפעולה מתאים למה שיש לך ב-authSlice
import { loginAsync } from './authSlice'; 
import { Button, TextField, Box, Typography, Container, InputAdornment, IconButton } from '@mui/material';

// ייבוא האייקונים של העין מ-Material UI
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // *** חדש! משתנה שזוכר אם להראות או להסתיר את הסיסמה ***
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginAsync({ email, password }));
    
    if (loginAsync.fulfilled.match(resultAction)) {
      navigate('/');
    } else {
      alert('שגיאה בהתחברות. אנא ודא שהאימייל והסיסמה נכונים.');
    }
  };

  // *** חדש! הפונקציה שמחליפה את המצב מלחיצה ללחיצה ***
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'white', textAlign: 'center' }}>
        
        <Typography variant="h4" gutterBottom sx={{ color: '#5d4037', fontWeight: 'bold' }}>
          התחברות 🔐
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField 
            fullWidth label="אימייל" type="email" value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            margin="normal" required 
          />
          
          {/* שדה הסיסמה המעודכן עם העין */}
          <TextField 
            fullWidth 
            label="סיסמה" 
            // אם showPassword הוא true נראה טקסט, אחרת נראה נקודות
            type={showPassword ? 'text' : 'password'} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            margin="normal" 
            required 
            InputProps={{
              // מוסיפים את הכפתור לקצה השדה
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {/* מציגים את העין הפתוחה או הסגורה בהתאם למצב */}
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button 
            type="submit" fullWidth variant="contained" 
            sx={{ mt: 3, mb: 2, bgcolor: '#b18e6a', '&:hover': { bgcolor: '#8d6e63' }, py: 1.5, fontSize: '1.1rem' }}
          >
            היכנס
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2 }}>
          עדיין אין לך חשבון?{' '}
          <Link to="/register" style={{ color: '#b18e6a', textDecoration: 'none', fontWeight: 'bold' }}>
            הירשם כאן
          </Link>
        </Typography>

      </Box>
    </Container>
  );
}