import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button,
  Container, Pagination, TextField, Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getAdminUsers } from '../../services/assistant.service';

// דף מנהלת: כל המשתמשים וההיסטוריה של מה שחיפשו (עם חיפוש ועימוד)
export default function AdminPrompts() {
  const token = useSelector((state) => state.auth.token);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false; // מונע עדכון מצב מבקשה ישנה
    getAdminUsers({ page, search }, token)
      .then((res) => {
        if (!ignore) {
          setData(res);
          setError('');
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.response?.data?.message || 'שגיאה בטעינת המשתמשים');
      });
    return () => { ignore = true; };
  }, [page, search, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', color: '#1a3761', mb: 3 }}>
        משתמשים וחיפושים
      </Typography>

      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          fullWidth size="small" label="חיפוש לפי שם או אימייל"
          value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button
          type="submit" variant="contained"
          sx={{ bgcolor: '#5d4037', borderRadius: '12px', px: 4, '&:hover': { bgcolor: '#3e2723' } }}
        >
          חיפוש
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!data && !error && <Typography color="text.secondary">טוען...</Typography>}
      {data && data.users.length === 0 && <Typography color="text.secondary">לא נמצאו משתמשים.</Typography>}

      {data?.users.map((u) => (
        <Accordion
          key={u._id} disableGutters elevation={0}
          sx={{ border: '1px solid #f0f0f0', borderRadius: '15px !important', mb: 1, '&::before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Typography sx={{ fontWeight: 'bold' }}>{u.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {u.email} {u.phone ? `| ${u.phone}` : ''} | {u.prompts.length} חיפושים
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {u.prompts.length === 0 && <Typography color="text.secondary">עוד לא חיפשה מפות.</Typography>}
            {u.prompts.map((p) => (
              <Box key={p._id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f5f5f5' }}>
                <Typography variant="body2" color="text.secondary">
                  {new Date(p.created_at).toLocaleString('he-IL')} | {p.category?.name} › {p.subCategory?.name}
                </Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{p.prompt}</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap', color: '#5d4037' }}>{p.response}</Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      {data && data.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={data.pages} page={page} onChange={(_, value) => setPage(value)} />
        </Box>
      )}
    </Container>
  );
}
