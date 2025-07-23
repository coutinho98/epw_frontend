// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';

import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminProductListPage from './pages/admin/AdminProductListPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<ProductsPage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
            </Route>
            <Route element={<AdminProtectedRoute />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route path="products" element={<AdminProductListPage />} />
              </Route>
            </Route>
          </Routes>
          <Toaster position="top-center" />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;