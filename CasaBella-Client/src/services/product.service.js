import axios from 'axios';

// מושך את הכתובת מהקובץ .env (http://localhost:5000/api)
const API_URL = import.meta.env.VITE_API_URL + '/products';

// פונקציה לשליפת כל המפות מהנוד
export const getAllProducts = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data; // מחזיר את רשימת המוצרים
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

// פונקציה לשליפת מוצר בודד לפי ID
export const getProductById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
    }
};