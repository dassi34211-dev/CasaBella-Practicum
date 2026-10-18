// ייבוא רכיבי הליבה של הראוטינג (ניווט) מריאקט
import { Routes, Route, Navigate } from 'react-router-dom';
// ייבוא כלי מרידאקס שמאפשר לנו לבדוק את המצב הגלובלי (האם המשתמש מחובר והאם הוא מנהל)
import { useSelector } from 'react-redux';
import './App.css';

// --- ייבוא קומפוננטות הליבה ---
import Navbar from './components/Navbar'; 
import ProductList from './features/products/ProductList'; 
import Login from './features/auth/Login'; 
import Register from './features/auth/Register'; 
import AddProduct from './features/products/AddProduct'; 

// --- ייבוא אזור העגלה וההזמנות ---
import Cart from './features/cart/Cart'; 
import Checkout from './features/cart/Checkout'; 
import MyOrders from './features/orders/MyOrders'; // דף היסטוריית הזמנות ללקוח
import AdminOrders from './features/orders/AdminOrders'; // דף ניהול כל ההזמנות למנהל

import AssistantPage from './features/assistant/AssistantPage';
import AdminPrompts from './features/assistant/AdminPrompts';


function App() {
  // שליפת אובייקט המשתמש מה-Redux כדי לבצע בדיקות הרשאה בזמן אמת
  const user = useSelector((state) => state.auth.user);

  return (
    <>
      {/* ה-Navbar מוצג תמיד בראש כל דף */}
      <Navbar />

      {/* הגדרת טבלת הניתובים של האתר */}
      <Routes>
        {/* --- נתיבים ציבוריים: פתוחים לכל גולש --- */}
        <Route path="/" element={<ProductList />} />        {/* דף הבית - קטלוג מוצרים */}
        <Route path="/login" element={<Login />} />          {/* דף התחברות */}
        <Route path="/register" element={<Register />} />    {/* דף הרשמה למשתמש חדש */}
        <Route path="/cart" element={<Cart />} />            {/* עגלת הקניות */}
        
        {/* --- נתיבים ללקוחות מחוברים בלבד --- */}
        <Route path="/checkout" element={<Checkout />} />    {/* דף קופה ותשלום */}
        <Route path="/my-orders" element={<MyOrders />} />   {/* דף "ההזמנות שלי" - היסטוריה אישית */}
                <Route path="/assistant" element={<AssistantPage />} /> {/* עוזרת בחירת מפות עם AI */}


        {/* --- נתיבים מוגנים (Admin Routes): למנהלים בלבד --- */}
        
        {/* דף הוספת מוצר חדש - גישה רק אם user קיים ושדה ה-isAdmin הוא true */}
        <Route 
          path="/add-product" 
          element={user && user.isAdmin ? <AddProduct /> : <Navigate to="/" />} 
        />
        
        {/* דף עריכת מוצר קיים - מזהה את המוצר לפי ה-id שב-URL */}
        <Route 
          path="/edit-product/:id" 
          element={user && user.isAdmin ? <AddProduct /> : <Navigate to="/" />} 
        />

        {/* דף ניהול הזמנות כללי - מציג למנהל את כל ההזמנות שבוצעו באתר */}
        <Route 
          path="/admin/orders" 
          element={user && user.isAdmin ? <AdminOrders /> : <Navigate to="/" />} 
        />

                {/* דף מנהלת: כל המשתמשים והחיפושים שלהם */}
        <Route 
          path="/admin/prompts" 
          element={user && user.isAdmin ? <AdminPrompts /> : <Navigate to="/" />} 
        />

        
        {/* במידה וגולש מנסה להגיע לכתובת שלא קיימת - נחזיר אותו לדף הבית */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;