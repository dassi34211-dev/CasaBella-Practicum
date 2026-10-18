import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Card, CardContent, CircularProgress, Box, Divider, Button } from '@mui/material';

export default function MyOrders() {
  // --- ניהול הסטייט (מצב) של הקומפוננטה ---
  // orders: שומר את מערך ההזמנות שנקבל מהשרת. מתחיל כמערך ריק [].
  const [orders, setOrders] = useState([]);
  
  // loading: שומר מצב טעינה. מתחיל כ-true כדי להציג "ספינר" בזמן שהבקשה נשלחת לשרת.
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate(); // מאפשר לנו לנווט את המשתמש לדפים אחרים (כמו לעמוד הבית או להתחברות)
  
  // שליפת המשתמש מתוך הסטייט הגלובלי של רידאקס
  const user = useSelector((state) => state.auth.user);

  // --- בקשת נתונים מהשרת ברגע שהדף עולה ---
  // useEffect רץ פעם אחת כשהקומפוננטה נטענת (בגלל מערך התלויות הריק בסוף)
  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        // 1. חילוץ הטוקן מהזיכרון המקומי של הדפדפן (LocalStorage)
        const token = localStorage.getItem('token');

        // 2. הגנה: אם אין טוקן (המשתמש לא מחובר או שהטוקן נמחק), נזרוק אותו חזרה לדף ההתחברות
        if (!token) {
          navigate('/login');
          return;
        }

        // 3. הגדרת כותרות (Headers) לבקשה כדי שהשרת ידע מי אנחנו. חייב להתאים למה שה-auth.js בשרת מחפש!
        const config = {
          headers: { 'x-auth-token': token }
        };

        // 4. שליחת בקשת GET לשרת לנתיב שיצרנו במיוחד עבור ההזמנות של המשתמש
        const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
        
        // 5. שמירת הנתונים שחזרו (מערך ההזמנות) בתוך הסטייט שלנו
        setOrders(data);
      } catch (error) {
        console.error("שגיאה בשליפת ההזמנות:", error);
      } finally {
        // 6. סיום טעינה: גם אם הצלחנו וגם אם הייתה שגיאה, נפסיק להציג את הספינר
        setLoading(false); 
      }
    };

    fetchMyOrders();
  }, [navigate]);

  // --- פונקציות עזר לתצוגה ---
  
  // פונקציה שהופכת את התאריך המכוער שחוזר ממונגו לתאריך קריא ויפה בעברית
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // פונקציה שמתרגמת את הסטטוס מאנגלית לעברית עם אימוג'י חמוד
  const translateStatus = (status) => {
    if (status === 'Pending') return 'ממתינה לאישור ⏳';
    if (status === 'Shipped') return 'נשלחה 🚚';
    return status;
  };

  // --- רינדור (ציור) הקומפוננטה ---

  // מצב 1: האתר עדיין טוען נתונים מהשרת -> נציג ספינר חמוד באמצע המסך
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: '#b18e6a' }} />
      </Box>
    );
  }

  // מצב 2 + 3: סיימנו לטעון, עכשיו נציג את התוכן
  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1a3761', mb: 4 }}>
        ההזמנות שלי 📦
      </Typography>

      {/* תנאי: אם מערך ההזמנות ריק, נציג הודעה מתאימה. אחרת, נעבור על המערך ונציג כל הזמנה. */}
      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            עדיין לא ביצעת הזמנות באתר...
          </Typography>
          <Button variant="contained" sx={{ mt: 2, bgcolor: '#b18e6a' }} onClick={() => navigate('/')}>
            למעבר לחנות
          </Button>
        </Box>
      ) : (
        // מעבר על מערך ההזמנות (map) ויצירת כרטיסייה (Card) לכל הזמנה
        orders.map((order) => (
          <Card key={order._id} elevation={3} sx={{ mb: 4, borderRadius: '15px' }}>
            <CardContent>
              {/* החלק העליון של הכרטיסייה: תאריך וסטטוס */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#5d4037' }}>
                  הזמנה מתאריך: {formatDate(order.createdAt)}
                </Typography>
                <Typography variant="subtitle1" sx={{ bgcolor: '#fdfbf9', px: 2, py: 0.5, borderRadius: '10px', border: '1px solid #eee' }}>
                  סטטוס: {translateStatus(order.status)}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* מעבר על מערך המוצרים (orderItems) בתוך ההזמנה הספציפית הזו */}
              {order.orderItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">
                    {item.name} <span style={{ color: 'gray' }}>x{item.quantity}</span>
                  </Typography>
                  <Typography variant="body1">₪{item.price * item.quantity}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* החלק התחתון של הכרטיסייה: כתובת וסה"כ לתשלום */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  נשלח אל: {order.shippingAddress.city}, {order.shippingAddress.street}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  סה"כ לתשלום: ₪{order.totalPrice}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}