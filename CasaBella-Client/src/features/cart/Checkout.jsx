import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { clearCart } from './cartSlice';
import { Box, Button, TextField, Typography, Container, Grid, Paper, Divider } from '@mui/material';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cartItems = useSelector((state) => state.cart.items);
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmitOrder = async (data) => {
    try {
      // === פתרון הקסם! מושכים את הטוקן ישירות מהמקום שמצאנו אותו ===
      const token = localStorage.getItem('token');

      if (!token) {
          alert("עליך להיות מחוברת כדי לבצע הזמנה (לא נמצא טוקן)");
          navigate('/login');
          return;
      }

      const orderData = {
        orderItems: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            product: item._id 
        })),
        shippingAddress: data,
        totalPrice: totalAmount
      };

      const config = {
        headers: { 'x-auth-token': token } 
      };

      // שולחים לשרת!
      const response = await axios.post('http://localhost:5000/api/orders', orderData, config);

      if (response.status === 201) {
        alert(`תודה רבה ${data.fullName}! ההזמנה נשמרה במונגו בהצלחה! ✨`);
        dispatch(clearCart()); 
        navigate('/');
      }
    } catch (error) {
      console.error("שגיאה בשליחת ההזמנה:", error);
      alert("הייתה שגיאה בשמירת ההזמנה. בדקי את הקונסול.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="h5">העגלה ריקה...</Typography>
        <Button onClick={() => navigate('/')}>חזרה לחנות</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1a3761' }}>
        סיום הזמנה ותשלום 🛍️
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '15px' }}>
            <Typography variant="h6" gutterBottom>פרטי משלוח</Typography>
            <form onSubmit={handleSubmit(onSubmitOrder)}>
              <TextField fullWidth label="שם מלא" margin="normal" {...register('fullName', { required: 'שדה חובה' })} error={!!errors.fullName} />
              <TextField fullWidth label="עיר" margin="normal" {...register('city', { required: 'שדה חובה' })} error={!!errors.city} />
              <TextField fullWidth label="רחוב ומספר" margin="normal" {...register('street', { required: 'שדה חובה' })} error={!!errors.street} />
              <TextField fullWidth label="טלפון" margin="normal" {...register('phone', { required: 'שדה חובה' })} error={!!errors.phone} />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 4, bgcolor: '#5d4037' }}>בצע הזמנה</Button>
            </form>
          </Paper>
        </Grid>

        {/* זה החלק של הסיכום! הוא נראה מעולה, אבל אפשר למחוק אותו אם תרצי */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '15px' }}>
            <Typography variant="h6" gutterBottom>סיכום</Typography>
            <Divider sx={{ mb: 2 }} />
            {cartItems.map((item) => (
              <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{item.name} x{item.quantity}</Typography>
                <Typography>₪{item.price * item.quantity}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">סה"כ: ₪{totalAmount}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}