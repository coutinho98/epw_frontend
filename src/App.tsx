import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import Layout from './components/Layout';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import RegisterPage from './pages/RegisterPage'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path='register' element={<RegisterPage />} />
            <Route element={<Layout />}>
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
            </Route>
          </Routes>
          <Toaster position='top-center' />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;