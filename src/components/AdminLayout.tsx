import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            <aside className="w-64 bg-zinc-900 p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-6">Painel de Admin</h2>
                <nav className="flex flex-col space-y-4">
                    <Link to="/admin/products" className="text-gray-300 hover:text-white">
                        Gerenciar Produtos
                    </Link>
                </nav>
                <div className="mt-auto">
                    <Button onClick={logout} className="w-full bg-red-600 hover:bg-red-700">
                        Sair
                    </Button>
                </div>
            </aside>
            
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;