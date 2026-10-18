// ייבוא הפונקציות מרידאקס וספריית אקסיוס לתקשורת מול השרת
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// כתובת השרת שלנו
const API_URL = 'http://localhost:5000/api';

// 1. שליפת כל המוצרים (GET)
export const fetchProductsAsync = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  }
);

// 2. הוספת מוצר חדש (POST)
export const addProductAsync = createAsyncThunk(
  'products/addProduct',
  async ({ formData, token }) => {
    const response = await axios.post(`${API_URL}/products`, formData, {
      headers: {
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
);

// 3. מחיקת מוצר (DELETE)
export const deleteProductAsync = createAsyncThunk(
  'products/deleteProduct',
  async ({ id, token }) => {
    await axios.delete(`${API_URL}/products/${id}`, {
      headers: {
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`
      }
    });
    return id;
  }
);

// --- הנה הפעולה החדשה שהייתה חסרה! ---
// 4. עדכון מוצר קיים (PUT)
export const updateProductAsync = createAsyncThunk(
  'products/updateProduct',
  async ({ id, formData, token }) => {
    // אנחנו שולחים את הבקשה לכתובת של המוצר הספציפי לפי ה-ID שלו
    const response = await axios.put(`${API_URL}/products/${id}`, formData, {
      headers: {
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data; // השרת מחזיר לנו את המוצר המעודכן
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // טיפול בשליפת מוצרים
      .addCase(fetchProductsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      // טיפול בהוספת מוצר - דוחף את המוצר החדש למערך
      .addCase(addProductAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // טיפול במחיקת מוצר - מסנן החוצה את המוצר שנמחק
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((product) => product._id !== action.payload);
      })
      // --- הנה הטיפול בעדכון שמונע מהמסך להישאר לבן! ---
      // טיפול בעדכון מוצר - מוצא את המוצר הישן ומחליף אותו בחדש
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload; // מחליפים את הישן בחדש שחזר מהשרת
        }
      });
  },
});

export default productSlice.reducer;