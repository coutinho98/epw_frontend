import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";

const AdmionProtectedRoute: React.FC = () => {
    const { user, isAuthenticated, loading } = useAuth();

 
    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!isAuthenticated || !user?.isAdmin) {
        if (isAuthenticated && !user?.isAdmin) {
            toast.error("Você não tem permissão para acessar esta página.");
        } else {
            toast.error("Você precisa estar logado.");
        }
        return <Navigate to="/login" replace />; 
    }

    return <Outlet />;
};

export default AdmionProtectedRoute;