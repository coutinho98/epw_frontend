import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner"

const AdmionProtectedRoute: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user?.isAdmin) {
        if (isAuthenticated && !user?.isAdmin) {
            toast.error("not permission")
        } else {
            toast.error("u need to login")
        }
        return <Navigate to="/" replace />
    }

    return <Outlet />
    
}

export default AdmionProtectedRoute;
