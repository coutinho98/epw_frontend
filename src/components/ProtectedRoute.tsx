import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'sonner';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    toast.error('Você precisa estar logado para acessar esta página.');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;