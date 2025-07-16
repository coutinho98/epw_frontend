import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-black text-white">
            <nav className="sticky top-0 z-50 px-4 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold">@empowerfitness</h1>
                        <p className="text-sm text-gray-400">technological fitness gym clothes</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-sm hover:text-gray-300">Account</button>
                        <button className="text-sm hover:text-gray-300">Cart</button>
                        <button className="text-sm hover:text-gray-300">Menu</button>
                    </div>
                </div>
            </nav>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;