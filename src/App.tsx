import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from './components/ui/sonner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import Layout from './components/Layout';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminProductListPage from './pages/admin/AdminProductListPage';
import CheckoutPage from './pages/CheckoutPage';
import ProtectedRoute from './components/ProtectedRoute';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCategoryPage from './pages/admin/AdminCategoryPage';

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
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="category/:categoryId" element={<ProductsPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="orders-history" element={<OrderHistoryPage />} />
            </Route>
            <Route element={<AdminProtectedRoute />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProductListPage />} />
                <Route path="categories" element={<AdminCategoryPage />} /> 
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

// FAZER PAGINAÇÃO NO BACK