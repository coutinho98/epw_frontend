import React from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from './ui/sheet';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const sidebarLinks = [
    { title: '★ MAIS VENDIDOS', href: '/products/bestsellers' },
    { title: 'porque vestir @empowerfitness?', href: '/about' },
    { title: 'top', href: '/products/make-book' },
    { title: 'legging', href: '/products' },
    { title: 'short', href: '/products1' },
    { title: 'outlet', href: '/products2' },
    { title: 'hidratação', href: '/products3' },
    { title: 'mochilas', href: '/product4s' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const isMobile = useIsMobile();

    const renderSidebarLinks = () => (
        <nav className="space-y-1 p-4 md:p-0"> 
            {sidebarLinks.map((link) => (
                <Link
                    key={link.href}
                    to={link.href}
                    onClick={onClose} 
                    className="block py-1 text-base text-white hover:underline underline-offset-4 px-2"
                >
                    {link.title}
                </Link>
            ))}
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