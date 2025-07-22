import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; 
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import Layout from './components/Layout';
import ProductDetailPage from './pages/ProductDetailPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider> 
        <CartProvider> 
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
            </Route>
          </Routes>
          <Toaster position='top-center'/>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;