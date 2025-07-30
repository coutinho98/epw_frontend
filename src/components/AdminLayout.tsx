import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext'; 

import { BarChart3, Package, Tag, ShoppingCart, Users, LogOut, LayoutDashboard } from 'lucide-react'; 

const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth(); 
    const location = useLocation(); 

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin/dashboard' },
        { id: 'products', label: 'Produtos', icon: Package, path: '/admin/products' },
        { id: 'variants', label: 'Variações', icon: Tag, path: '/admin/variants' },
        { id: 'categories', label: 'Categorias', icon: Tag, path: '/admin/categories' },
        { id: 'orders', label: 'Pedidos', icon: ShoppingCart, path: '/admin/orders' },
        { id: 'users', label: 'Usuários', icon: Users, path: '/admin/users' },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            <aside className="w-64 bg-zinc-900 p-6 flex flex-col border-r border-zinc-800">
                <div className="mb-8">
                    <h1 className="text-xl font-bold">Painel de Admin</h1>
                    {user && (
                        <p className="text-sm text-gray-400">Olá, {user.firstName || user.email}!</p>
                    )}
                </div>
                
                <nav className="flex-1">
                    <ul className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon; 
                            return (
                                <li key={tab.id}>
                                    <NavLink
                                        to={tab.path}
                                        className={({ isActive }) => 
                                            `w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors 
                                            ${isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-300 hover:bg-zinc-800 hover:text-white'
                                            }`
                                        }
                                    >
                                        <Icon className="h-5 w-5" /> 
                                        <span>{tab.label}</span> 
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="mt-auto pt-6 border-t border-zinc-800">
                    <Button 
                        onClick={logout} 
                        className="w-full bg-red-600 hover:bg-red-700"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                    </Button>
                </div>
            </aside>
            
            <main className="flex-1 p-8 overflow-auto">
                <Outlet /> 
            </main>
        </div>
    );
};

export default AdminLayout;