import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// ייבוא של Redux
import { Provider } from 'react-redux';
import { store } from './app/store';

// ייבוא של הראוטר (הנווט)
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      {/* הוספנו את הראוטר שעוטף את האפליקציה */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);