// ייבוא פונקציות מרידאקס: useSelector למשיכת נתונים, useDispatch לשיגור פעולות
import { useSelector, useDispatch } from 'react-redux';
// ייבוא פעולות העגלה מהסלייס שלנו
import { addToCart, removeFromCart } from './cartSlice';
// ייבוא רכיבי עיצוב מ-Material UI
import { Box, Typography, Container, Paper, IconButton, Button, Divider } from '@mui/material';
// ייבוא אייקונים מעוצבים
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
// ייבוא כלי ניווט מ-React Router
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  // שולפים מהסטייט הגלובלי את פרטי העגלה
  const { items, totalAmount } = useSelector((state) => state.cart);
  
  // *** חדש: שולפים את המשתמש כדי לבדוק אם הוא מחובר ***
  const user = useSelector((state) => state.auth.user);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // *** פונקציית הגנה: בודקת אם המשתמש מחובר לפני מעבר לקופה ***
  const handleCheckout = () => {
    if (!user) {
      // אם המשתמש לא מחובר - מקפיצים הודעה ומעבירים אותו לדף התחברות
      alert('כדי לבצע רכישה, עליך להתחבר לחשבון שלך');
      navigate('/login');
    } else {
      // אם המשתמש מחובר - מאפשרים לו להתקדם לדף התשלום
      navigate('/checkout');
    }
  };

  // תצוגה במקרה שהעגלה ריקה
  if (items.length === 0) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h5">העגלה שלך ריקה...</Typography>
        <Button component={Link} to="/" sx={{ mt: 3, color: '#b18e6a' }}>חזרה לקניות</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      {/* כותרת העמוד */}
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1a3761', textAlign: 'center' }}>
        עגלת הקניות שלי
      </Typography>
      
      {/* כרטיס לבן שמרכז את כל תוכן העגלה */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #f0f0f0' }}>
        
        {/* מעבר על כל המוצרים בעגלה והצגתם */}
        {items.map((item) => (
          <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            {/* הצגת תמונת המוצר מהשרת */}
            <img 
              src={`http://localhost:5000/${item.image}`} 
              alt={item.name} 
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} 
            />
            
            {/* שם המוצר ומחיר ליחידה */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">{item.price} ₪</Typography>
            </Box>

            {/* כפתורי פלוס ומינוס לשינוי כמות */}
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #eee', borderRadius: '10px' }}>
              <IconButton size="small" onClick={() => dispatch(removeFromCart(item._id))}>
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
              <IconButton size="small" onClick={() => dispatch(addToCart(item))}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* סיכום מחיר לשורה ספציפית */}
            <Typography sx={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'left' }}>
               {item.price * item.quantity} ₪
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* שורת סך הכל לתשלום */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">סה"כ לתשלום:</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#b18e6a' }}>{totalAmount} ₪</Typography>
        </Box>

        {/* כפתור המעבר לקופה - עכשיו הוא מוגן ע"י הפונקציה handleCheckout */}
        <Button 
          fullWidth 
          variant="contained" 
          sx={{ mt: 4, bgcolor: '#5d4037', py: 1.5, borderRadius: '12px', fontSize: '1.1rem' }}
          onClick={handleCheckout}
        >
          המשך לתשלום
        </Button>
      </Paper>
    </Container>
  );
}