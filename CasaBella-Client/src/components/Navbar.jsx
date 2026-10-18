import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setLogout } from '../features/auth/authSlice';
import { clearCart } from '../features/cart/cartSlice'; 
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import logoImg from '../assets/logo.webp';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingCartOutlineIcon from '@mui/icons-material/ShoppingCartOutlined';

export default function Navbar() {
  // שליפת המשתמש והעגלה מה-Redux כדי לעדכן את הממשק בזמן אמת
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // פונקציה לניקוי תווים מיוחדים בשם המשתמש (מטפלת בבעיות קידוד של עברית)
  const getCleanName = (name) => {
    if (!name) return "";
    try {
      return decodeURIComponent(escape(name));
    } catch (e) {
      return name; 
    }
  };

  // פונקציית התנתקות: מנקה את העגלה מהרידאקס, מוחקת את פרטי המשתמש ומחזירה לדף הבית
  const handleLogout = () => {
    dispatch(clearCart()); 
    dispatch(setLogout());
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1, width: '100%' }}>
      {/* שורת הכרזה עליונה (Top Bar) לעיצוב ומבצעים */}
      <Box sx={{ 
        bgcolor: '#e9dad1', py: 1, textAlign: 'center', 
        fontSize: '0.9rem', color: '#5d4037', width: '100%'
      }}>
        משלוח חינם מעל 550 ש"ח | מארז מתנה על כל קנייה 🎁
      </Box>

      <AppBar position="static" sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none', borderBottom: '1px solid #eee' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: '20px !important' }}>
          
          {/* צד ימין: תפריט ניווט ראשי וכפתורי מנהל */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             <Button color="inherit" component={Link} to="/" sx={{ minWidth: 'auto', fontWeight: 500 }}>
               מפות שולחן
             </Button>

             {/* חדש: עוזרת בחירת מפות עם AI (פתוח לכולם) */}
             <Button color="inherit" component={Link} to="/assistant" sx={{ minWidth: 'auto', fontWeight: 500 }}>
               עוזרת בחירת מפות
             </Button>
             
             {/* הרשאות מנהל: כפתורים שיופיעו רק אם המשתמש הוא Admin */}
             {user?.isAdmin && (
               <>
                 <Button color="inherit" component={Link} to="/admin/orders" sx={{ fontWeight: 500 }}>
                   ניהול הזמנות
                 </Button>
                 {/* חדש: כל המשתמשים והחיפושים שלהם */}
                 <Button color="inherit" component={Link} to="/admin/prompts" sx={{ fontWeight: 500 }}>
                   חיפושי לקוחות
                 </Button>
                 <Button 
                   variant="outlined" component={Link} to="/add-product" 
                   sx={{ borderColor: '#b18e6a', color: '#b18e6a', borderRadius: '10px', py: 0.2, fontWeight: 'bold', '&:hover': { bgcolor: '#fdfbf9', borderColor: '#8d6e63' } }}
                 >
                   + הוספת מוצר
                 </Button>
               </>
             )}
          </Box>

          {/* מרכז: לוגו האתר (לחיץ ומחזיר לדף הבית) */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logoImg} alt="CasaBella" style={{ height: '60px' }} />
          </Link>

          {/* צד שמאל: אזור אישי, עגלה והתנתקות */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
            {/* בדיקה: האם המשתמש מחובר? */}
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1, fontWeight: 500 }}>
                   שלום, {getCleanName(user.name)}
                </Typography>
                
                {/* כפתור היסטוריית הזמנות ללקוח מחובר */}
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/my-orders" 
                  sx={{ fontSize: '0.85rem', mr: 1, color: '#5d4037', fontWeight: 'bold' }}
                >
                  ההזמנות שלי
                </Button>

                <IconButton size="small" onClick={handleLogout} title="התנתקות">
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              /* אם לא מחובר: הצגת כפתור כניסה לאתר */
              <IconButton component={Link} to="/login" title="התחברות">
                <PersonOutlineIcon />
              </IconButton>
            )}
            
            {/* כפתור עגלת קניות עם "בועה" המציגה את כמות הפריטים */}
            <IconButton component={Link} to="/cart">
              <Box sx={{ position: 'relative' }}>
                <ShoppingCartOutlineIcon />
                {cartItems.length > 0 && (
                  <Box sx={{ 
                    position: 'absolute', top: -5, right: -5, bgcolor: '#b18e6a', 
                    color: 'white', borderRadius: '50%', width: 18, height: 18, 
                    fontSize: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' 
                  }}>
                    {/* חישוב סך כל הכמויות של המוצרים בעגלה */}
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </Box>
                )}
              </Box>
            </IconButton>
          </Box>

        </Toolbar>
      </AppBar>
    </Box>
  );
}
