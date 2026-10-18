import { createSlice } from '@reduxjs/toolkit';

// --- פונקציות עזר לשמירה וקריאה מהזיכרון של הדפדפן (Local Storage) ---

// 1. פונקציה לקריאת העגלה מהזיכרון (מופעלת כשהאתר עולה)
const loadCartFromLocalStorage = () => {
  try {
    // מנסים למשוך את המידע ששמור תחת השם 'casabella_cart'
    const savedCart = localStorage.getItem('casabella_cart');
    // אם יש מידע, אנחנו ממירים אותו חזרה מטקסט לאובייקט של ג'אווה-סקריפט (JSON.parse)
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error("שגיאה בטעינת העגלה מהזיכרון:", error);
  }
  // אם אין שום דבר בזיכרון (או שהייתה שגיאה), נחזיר עגלה ריקה כברירת מחדל
  return { items: [], totalAmount: 0 };
};

// 2. פונקציה לשמירת העגלה לזיכרון (מופעלת בכל פעם שהעגלה משתנה)
const saveCartToLocalStorage = (state) => {
  try {
    // ממירים את מצב העגלה (state) לאובייקט טקסטואלי (JSON.stringify) שומרים בזיכרון
    const serializedState = JSON.stringify(state);
    localStorage.setItem('casabella_cart', serializedState);
  } catch (error) {
    console.error("שגיאה בשמירת העגלה לזיכרון:", error);
  }
};

// --- הגדרת המצב ההתחלתי של העגלה ---
// במקום להתחיל תמיד מ- { items: [], totalAmount: 0 }, אנחנו קוראים לפונקציה שתבדוק אם כבר יש עגלה שמורה!
const initialState = loadCartFromLocalStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // --- הוספת מוצר לעגלה ---
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item._id === product._id);

      if (existingItem) {
        existingItem.quantity += 1; // אם המוצר קיים, רק נעלה את הכמות
      } else {
        state.items.push({ ...product, quantity: 1 }); // אם חדש, נוסיף אותו לרשימה עם כמות 1
      }
      
      state.totalAmount += product.price; // נעדכן את המחיר הכולל
      
      // *** הוספנו! אחרי כל שינוי, שומרים מיד לזיכרון של הדפדפן ***
      saveCartToLocalStorage(state);
    },
    
    // --- הסרת מוצר מהעגלה (מינוס) ---
    removeFromCart: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find(item => item._id === id);

      if (existingItem) {
        state.totalAmount -= existingItem.price; // מורידים את המחיר מהסך הכללי
        
        if (existingItem.quantity === 1) {
          // אם יש רק אחד, נסנן אותו לגמרי מהרשימה
          state.items = state.items.filter(item => item._id !== id);
        } else {
          // אחרת, רק נוריד את הכמות ב-1
          existingItem.quantity -= 1;
        }
      }
      
      // *** הוספנו! גם אחרי הסרה, שומרים לזיכרון ***
      saveCartToLocalStorage(state);
    },

    // --- ריקון כל העגלה (מופעל כשמתנתקים או אחרי תשלום) ---
    clearCart: (state) => {
      state.items = []; // מאפסים את המערך
      state.totalAmount = 0; // מאפסים את המחיר
      
      // *** הוספנו! מוחקים גם מהזיכרון של הדפדפן ***
      localStorage.removeItem('casabella_cart');
    }
  }
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;