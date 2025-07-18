import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Button } from './ui/button';
import { MenuIcon, UserRoundIcon, WalletIcon } from 'lucide-react';

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="max-w-screen-2xl mx-auto px-4 md:px-8 w-full">
                <nav className="sticky top-0 z-50 h-20 flex items-center">
                    <div className="flex items-center justify-between w-full">
                        <div className="hidden md:block  pr-2 flex-shrink-0"></div>
                        <div className="flex items-center md:hidden">
                            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                                <MenuIcon className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </div>
                        <div className="flex-1 text-center md:text-left mt-4">
                            <h1 className="text-lg font-bold">@empowerfitness | fitness clothing</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon" className="hidden sm:flex text-sm hover:text-gray-300">
                                <UserRoundIcon className="h-5 w-5" />
                                <span className="sr-only">Account</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-sm hover:text-gray-300">
                                <WalletIcon className="h-5 w-5" />
                                <span className="sr-only">Cart</span>
                            </Button>
                        </div>
                    </div>
                </nav>

                <div className="flex flex-1 py-8 items-start">
                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                    <main className="flex-1 min-h-[calc(100vh-64px)]">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;