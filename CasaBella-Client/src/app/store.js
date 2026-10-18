import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../features/products/productSlice';
import authReducer from '../features/auth/authSlice';
// 1. מייבאים את ה-reducer של העגלה
import cartReducer from '../features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
    // 2. מוסיפים אותו למוח המרכזי
    cart: cartReducer, 
  },
});