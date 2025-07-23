import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';
import {
    Sheet,
    SheetContent
} from './ui/sheet';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const sidebarLinks = [
    { title: '★ MAIS VENDIDOS', href: '/' },
    { title: 'porque vestir @empowerfitness?', href: '/about' },
    { title: 'top', href: '/products/make-book' },
    { title: 'legging', href: '/products111' },
    { title: 'short', href: '/products1' },
    { title: 'outlet', href: '/products2' },
    { title: 'hidratação', href: '/products3' },
    { title: 'mochilas', href: '/product4s' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const isMobile = useIsMobile();
    const { user, isAuthenticated } = useAuth();

    const renderSidebarLinks = () => (
        <nav className="space-y-1 p-4 ml-2 md:p-0">
            {sidebarLinks.map((link) => (
                <Link
                    key={link.href}
                    to={link.href}
                    onClick={onClose}
                    className="block mt-6 text-base text-white hover:underline underline-offset-4 "
                >
                    {link.title}
                </Link>
            ))}
            {isAuthenticated && user?.isAdmin && (
                <Link
                    to="/admin/products"
                    onClick={onClose}
                    className="block py-1 text-base text-white hover:underline underline-offset-4 px-2 bg-red-600 font-bold mt-4"
                >
                    Admin
                </Link>
            )}
        </nav>
    );

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="left" className="w-64 bg-black text-white border-r-gray-800">
                    <div className="mt-8">
                        {renderSidebarLinks()}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <aside className="w-48 flex-shrink-0 pr-8 sticky top-20 hidden md:block h-fit">
            {renderSidebarLinks()}
        </aside>
    );
};

export default Sidebar;