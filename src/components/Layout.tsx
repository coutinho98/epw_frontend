import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Button } from './ui/button';
import { MenuIcon, UserRoundIcon, WalletIcon } from 'lucide-react';
import CartSidebar from './CartSidebar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { toggleCart, cartItemCount } = useCart();
    const { isAuthenticated, user, logout } = useAuth();

    const messages = [
        "10% DE DESCONTO NO PIX!",
        "FRETE GRÁTIS EM COMPRAS ACIMA DE R$199!",
        "NOVIDADES TODO MÊS, FIQUE LIGADO!"
    ];
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [messages.length]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="w-full bg-white text-black py-2 text-center text-sm font-semibold tracking-wide overflow-hidden">
                <span 
                    key={currentMessageIndex} 
                    className="block animate-fade-in-out" 
                >
                    {messages[currentMessageIndex]}
                </span>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 md:px-8 w-full">
                <nav className="sticky top-0 z-50 h-20 flex items-center">
                    <div className="flex items-center justify-between w-full">
                        <div className="hidden md:block pr-2 flex-shrink-0"></div>
                        <div className="flex items-center md:hidden">
                            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                                <MenuIcon className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </div>
                        <div className="flex-1 text-center md:text-left mt-4">
                            <h1 className="text-lg md:text-2xl font-bold">@empowerfitness | fitness clothing</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="hidden sm:flex text-sm hover:text-gray-300">
                                            <UserRoundIcon className="h-5 w-5" />
                                            <span className="sr-only">Conta</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>Olá, {user?.firstName}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link to="/orders-history">Meus Pedidos</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/cart">Carrinho</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link to="/login" className="hidden sm:flex text-sm hover:text-gray-300">
                                    <Button variant="ghost" size="icon">
                                        <UserRoundIcon className="h-5 w-5" />
                                        <span className="sr-only">Login</span>
                                    </Button>
                                </Link>
                            )}
                            <Button variant="ghost" size="icon" onClick={toggleCart} className="text-sm hover:text-gray-300 relative">
                                <WalletIcon className="h-5 w-5" />
                                <span className="sr-only">Cart</span>
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold  h-5 w-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
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
            <CartSidebar />
        </div>
    );
};

export default Layout;