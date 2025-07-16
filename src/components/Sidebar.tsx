import { Link } from 'react-router-dom';

const sidebarLinks = [
    { title: '★ MAIS VENDIDOS', href: '/products/bestsellers' },
    { title: 'porque vestir @empowerfitness?', href: '/about' },
    { title: 'top', href: '/products/make-book' },
    { title: 'legging', href: '/products' },
    { title: 'short', href: '/products' },
    { title: 'outlet', href: '/products' },
    { title: 'hidratação', href: '/products' },
    { title: 'mochilas', href: '/products' },
];

const Sidebar = () => {
    return (
        <aside className="w-56 h-screen flex-shrink-0 pr-8 sticky top-0">
            <nav className="space-y-1">
                {sidebarLinks.map((link) => (
                    <Link
                        key={link.href}
                        to={link.href}
                        className="block py-1 text-base text-white hover:underline underline-offset-4"
                    >
                        {link.title}
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;