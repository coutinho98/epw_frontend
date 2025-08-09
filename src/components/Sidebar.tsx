import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';
import {
    Sheet,
    SheetContent
} from './ui/sheet';
import { useAuth } from '@/context/AuthContext';
import api from '../services/api';
import { Category } from '../types/Category';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const isMobile = useIsMobile();
    const { user, isAuthenticated } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get<Category[]>('/categories');
                setCategories(response);
            } catch (error) {
                console.error("Falha ao buscar categorias:", error);
            }
        };
        fetchCategories();
    }, []);

    const sidebarLinks = [
        { title: '★ MAIS VENDIDOS', href: '/' },
    ];

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
            {categories.length > 0 && (
                <>
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/category/${category.id}`}
                            onClick={onClose}
                            className="block mt-6 text-base text-white hover:underline underline-offset-4"
                        >
                            {category.name}
                        </Link>
                    ))}
                </>
            )}
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