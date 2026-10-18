import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button,
  CircularProgress, Container, MenuItem, Paper, TextField, Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  getCategories, getSubCategories, sendPrompt, getMyPrompts
} from '../../services/assistant.service';
import RecommendationCard from './RecommendationCard';

export default function AssistantPage() {
  const token = useSelector((state) => state.auth.token);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // react-hook-form מנהל רק את תיבת הטקסט (כמו ב-AddProduct)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { prompt: '' }
  });

  const loadHistory = useCallback(async () => {
    if (!token) return;
    try {
      setHistory(await getMyPrompts(token));
    } catch {
      setError('לא הצלחנו לטעון את ההיסטוריה');
    }
  }, [token]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('לא הצלחנו לטעון את הקטגוריות'));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // כשמחליפים קטגוריה: מאפסים את תת-הקטגוריה וטוענים את החדשות
  const handleCategoryChange = async (e) => {
    const id = e.target.value;
    setCategoryId(id);
    setSubCategoryId('');
    setSubCategories([]);
    try {
      setSubCategories(await getSubCategories(id));
    } catch {
      setError('לא הצלחנו לטעון את תתי-הקטגוריות');
    }
  };

  const onSubmit = async ({ prompt }) => {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const saved = await sendPrompt({ categoryId, subCategoryId, prompt }, token);
      setResult(saved);
      reset();
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'משהו השתבש, נסי שוב');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', color: '#1a3761', mb: 1 }}>
        מוצאים את המפה המושלמת
      </Typography>
      <Typography align="center" sx={{ color: '#5d4037', mb: 4 }}>
        ספרי לנו איזו מפה את מחפשת, ונבחר עבורך את המפות שהכי מתאימות מהחנות
      </Typography>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '25px', border: '1px solid #f0f0f0' }}>
        {!token && (
          <Alert severity="info" sx={{ mb: 2 }}>
            כדי לקבל המלצה צריך <Link to="/login">להתחבר</Link>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            select fullWidth margin="normal" label="קטגוריה"
            value={categoryId} onChange={handleCategoryChange}
          >
            {categories.map((c) => (
              <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select fullWidth margin="normal" label="תת-קטגוריה"
            value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)}
            disabled={!categoryId}
          >
            {subCategories.map((s) => (
              <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth multiline minRows={3} margin="normal" label="מה את מחפשת?"
            placeholder="למשל: מפה בגווני בז' לשולחן שבת, עד 300 ש״ח"
            {...register('prompt', {
              required: 'נא לתאר מה את מחפשת',
              minLength: { value: 5, message: 'התיאור קצר מדי' },
              maxLength: { value: 500, message: 'עד 500 תווים' }
            })}
            error={!!errors.prompt}
            helperText={errors.prompt?.message}
          />

          <Button
            type="submit" fullWidth variant="contained"
            disabled={!token || !subCategoryId || loading}
            sx={{ mt: 2, py: 1.5, bgcolor: '#5d4037', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', '&:hover': { bgcolor: '#3e2723' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'קבלי המלצה'}
          </Button>
        </form>
      </Paper>

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

      {result && (
        <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: '25px', border: '1px solid #eaded7', bgcolor: '#fdfaf8' }}>
          <RecommendationCard item={result} />
        </Paper>
      )}

      {token && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a3761', mb: 2 }}>
            החיפושים שלי
          </Typography>
          {history.length === 0 && (
            <Typography color="text.secondary">עוד לא חיפשת מפות. התיאור הראשון שלך יופיע כאן.</Typography>
          )}
          {history.map((h) => (
            <Accordion
              key={h._id} disableGutters elevation={0}
              sx={{ border: '1px solid #f0f0f0', borderRadius: '15px !important', mb: 1, '&::before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                  <Typography sx={{ fontWeight: 'bold' }}>{h.prompt}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {h.category?.name} › {h.subCategory?.name}, {new Date(h.created_at).toLocaleDateString('he-IL')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <RecommendationCard item={h} />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Container>
  );
}
