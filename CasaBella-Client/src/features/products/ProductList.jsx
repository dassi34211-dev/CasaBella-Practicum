import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { fetchProductsAsync, deleteProductAsync } from './productSlice';
import { addToCart } from '../cart/cartSlice';
import { Button, Box, Typography, IconButton, Paper, Alert, Collapse } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close'; 
import logoImg from "../../assets/logo.webp";

export default function ProductList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, status } = useSelector((state) => state.products);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const [showMsg, setShowMsg] = useState(false);
  const [lastAdded, setLastAdded] = useState('');

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProductsAsync());
  }, [status, dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    setLastAdded(product.name);
    setShowMsg(true);
    
    setTimeout(() => setShowMsg(false), 5000);
  };

  // --- הנה הפונקציה שחזרה! מקפיצה חלון אישור לפני מחיקה ---
  const handleDelete = (id, name) => {
    if (window.confirm(`האם את בטוחה שברצונך למחוק את המפה "${name}" לצמיתות?`)) {
      dispatch(deleteProductAsync({ id, token }));
    }
  };

  return (
    <Box sx={{ width: '100%', py: 5, px: { xs: 2, md: 4 }, boxSizing: 'border-box' }}>
      
      {/* 1. כותרת ולוגו */}
      <Box sx={{ textAlign: 'center', mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a3761' }}>
            המפות של
          </Typography>
          <img src={logoImg} alt="logo" style={{ height: '40px' }} />
        </Box>
        <Box sx={{ width: '60px', height: '2px', bgcolor: '#eaded7' }} />
      </Box>

      {/* 2. הודעת הוספה לעגלה */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 4, height: '60px' }}>
        <Collapse in={showMsg} sx={{ width: { xs: '100%', md: '50%' } }}>
          <Alert
            severity="success"
            variant="filled"
            action={
              <IconButton color="inherit" size="small" onClick={() => setShowMsg(false)}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ bgcolor: '#eaded7', color: '#5d4037', borderRadius: '15px', fontWeight: 'bold', '& .MuiAlert-icon': { color: '#5d4037' } }}
          >
            {lastAdded} נוסף לעגלה בהצלחה! 🛒
          </Alert>
        </Collapse>
      </Box>

      {/* 3. גריד המוצרים */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
        gap: '24px',
        width: '100%'
      }}>
        {status === 'succeeded' && products.map((p) => (
          <Paper elevation={0} key={p._id} sx={{ 
            p: 2, borderRadius: '25px', border: '1px solid #f0f0f0',
            textAlign: 'center', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', height: '480px', boxSizing: 'border-box'
          }}>
            <Box>
              <Box sx={{ position: 'relative', height: '220px', mb: 2 }}>
                <img 
                  src={`http://localhost:5000/${p.image}`} 
                  alt={p.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} 
                />
                
                {/* כפתורי עריכה ומחיקה למנהל */}
                {user?.isAdmin && (
                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1, bgcolor: 'rgba(255, 255, 255, 0.8)', padding: '4px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/edit-product/${p._id}`)} 
                      sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' } }}
                      title="עריכת מוצר"
                    >
                      <EditIcon fontSize="small" color="primary" />
                    </IconButton>
                    
                    {/* הפעלת פונקציית האזהרה שיצרנו לפני המחיקה */}
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(p._id, p.name)} 
                      sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#ffebee' } }}
                      title="מחיקת מוצר"
                    >
                      <DeleteOutlineIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              
              <Typography variant="body1" sx={{ fontWeight: 'bold', height: '3.2em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.6', mb: 1 }}>
                {p.name}
              </Typography>
              
              <Typography variant="h6" sx={{ color: '#b18e6a', fontWeight: 'bold' }}>
                {p.price} ₪
              </Typography>
            </Box>

            <Button 
              fullWidth
              variant="contained"
              onClick={() => handleAddToCart(p)}
              sx={{ bgcolor: '#5d4037', borderRadius: '15px', py: 1.2, textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#3e2723' } }}
            >
              הוספה לסל
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}