import { useDispatch } from 'react-redux';
import { Box, Button, Paper, Typography } from '@mui/material';
import { addToCart } from '../cart/cartSlice';
import { IMAGE_BASE } from '../../services/assistant.service';

// מציג תשובת AI אחת: ההסבר + המפות שהומלצו (עם הוספה לסל)
// משמש גם לתוצאה החדשה וגם להיסטוריה
export default function RecommendationCard({ item }) {
  const dispatch = useDispatch();
  // מוצר שנמחק מהחנות יחזור כ-null, אז מסננים אותו
  const products = (item.recommendedProducts || []).filter(Boolean);

  return (
    <Box>
      <Typography sx={{ whiteSpace: 'pre-wrap', color: '#5d4037', mb: 2 }}>
        {item.response}
      </Typography>

      {products.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
          {products.map((p) => (
            <Paper
              key={p._id}
              elevation={0}
              sx={{ p: 1.5, borderRadius: '20px', border: '1px solid #f0f0f0', textAlign: 'center' }}
            >
              <img
                src={`${IMAGE_BASE}/${p.image}`}
                alt={p.name}
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '15px' }}
              />
              <Typography sx={{ fontWeight: 'bold', mt: 1 }}>{p.name}</Typography>
              <Typography sx={{ color: '#b18e6a', fontWeight: 'bold', mb: 1 }}>{p.price} ₪</Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => dispatch(addToCart(p))}
                sx={{ bgcolor: '#5d4037', borderRadius: '15px', textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#3e2723' } }}
              >
                הוספה לסל
              </Button>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
