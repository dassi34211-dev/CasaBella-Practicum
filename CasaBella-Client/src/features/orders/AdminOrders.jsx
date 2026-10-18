import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Chip 
} from '@mui/material';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        
        // פנייה לראוט החדש של המנהל (GET /api/orders)
        const { data } = await axios.get('http://localhost:5000/api/orders', config);
        setOrders(data);
      } catch (error) {
        console.error("שגיאה בשליפת הזמנות מנהל:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllOrders();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
        ניהול הזמנות באתר 📋
      </Typography>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: '15px' }}>
        <Table sx={{ minWidth: 650 }} aria-label="orders table">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>לקוח</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>מוצרים</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>סה"כ</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>כתובת למשלוח</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>סטטוס</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="right">{formatDate(order.createdAt)}</TableCell>
                <TableCell align="right">
                  {order.user ? `${order.user.name} (${order.user.email})` : 'משתמש נמחק'}
                </TableCell>
                <TableCell align="right">
                  {order.orderItems.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                </TableCell>
                <TableCell align="right">₪{order.totalPrice}</TableCell>
                <TableCell align="right">
                  {order.shippingAddress.city}, {order.shippingAddress.street}
                </TableCell>
                <TableCell align="right">
                  <Chip 
                    label={order.status === 'Pending' ? 'ממתין' : 'הושלם'} 
                    color={order.status === 'Pending' ? 'warning' : 'success'} 
                    size="small" 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}