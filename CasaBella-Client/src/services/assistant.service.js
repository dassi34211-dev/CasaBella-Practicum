import axios from 'axios';

// אותה כתובת בסיס כמו ב-auth.service.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// כתובת השרת לתמונות (בלי /api בסוף)
export const IMAGE_BASE = API_URL.replace(/\/api\/?$/, '');

// השרת שלך מצפה לטוקן בכותרת x-auth-token
const authConfig = (token) => ({ headers: { 'x-auth-token': token } });

export const getCategories = async () => {
    const { data } = await axios.get(`${API_URL}/assistant/categories`);
    return data;
};

export const getSubCategories = async (categoryId) => {
    const { data } = await axios.get(`${API_URL}/assistant/categories/${categoryId}/sub-categories`);
    return data;
};

export const sendPrompt = async (body, token) => {
    const { data } = await axios.post(`${API_URL}/assistant/prompts`, body, authConfig(token));
    return data;
};

export const getMyPrompts = async (token) => {
    const { data } = await axios.get(`${API_URL}/assistant/prompts/me`, authConfig(token));
    return data;
};

export const getAdminUsers = async ({ page, search }, token) => {
    const { data } = await axios.get(`${API_URL}/assistant/admin/users`, {
        ...authConfig(token),
        params: { page, search }
    });
    return data;
};