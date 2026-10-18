// ייבוא הפונקציה שיוצרת פרוסת מידע (Slice) והפונקציה לפעולות אסינכרוניות (createAsyncThunk)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// ייבוא אקסיוס כדי שנוכל לשלוח בקשות לשרת
import axios from 'axios';

// כתובת השרת שלנו
const API_URL = 'http://localhost:5000/api';

// פונקציית עזר לפיענוח הטוקן (לדעת אם המשתמש הוא מנהל)
const decodeToken = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (e) {
        return null;
    }
};

// --- פעולת ההרשמה (תוקנה הכתובת ל-/register!) ---
export const registerAsync = createAsyncThunk(
    'auth/register',
    async (userData, thunkAPI) => {
        try {
            // התיקון החשוב: הוספנו /register בסוף הכתובת
            const response = await axios.post(`${API_URL}/users/register`, userData);
            const token = response.headers['x-auth-token'] || response.data.token || response.data;
            return token;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// --- פעולת ההתחברות (loginAsync) הוספנו אותה כדי שהעין תעבוד! ---
export const loginAsync = createAsyncThunk(
    'auth/login',
    async (userData, thunkAPI) => {
        try {
            // פנייה לנתיב ההתחברות בשרת
            const response = await axios.post(`${API_URL}/users/login`, userData);
            const token = response.headers['x-auth-token'] || response.data.token || response.data;
            return token;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// הגדרת המצב הראשוני (initialState)
const initialState = {
    token: localStorage.getItem('token') || null,
    user: localStorage.getItem('token') ? decodeToken(localStorage.getItem('token')) : null,
};

// יצירת ה-Slice של משתמשים (auth)
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLogin: (state, action) => {
            state.token = action.payload; 
            state.user = decodeToken(action.payload); 
            localStorage.setItem('token', action.payload); 
        },
        setLogout: (state) => {
            state.token = null; 
            state.user = null; 
            localStorage.removeItem('token'); 
        }
    },
    extraReducers: (builder) => {
        builder
            // טיפול בהרשמה מוצלחת
            .addCase(registerAsync.fulfilled, (state, action) => {
                const token = action.payload; 
                if (typeof token === 'string') {
                    state.token = token; 
                    state.user = decodeToken(token); 
                    localStorage.setItem('token', token); 
                }
            })
            // טיפול בהתחברות מוצלחת
            .addCase(loginAsync.fulfilled, (state, action) => {
                const token = action.payload; 
                if (typeof token === 'string') {
                    state.token = token; 
                    state.user = decodeToken(token); 
                    localStorage.setItem('token', token); 
                }
            });
    }
});

// ייצוא הפעולות הרגילות
export const { setLogin, setLogout } = authSlice.actions;

// ייצוא ה-Reducer הראשי
export default authSlice.reducer;