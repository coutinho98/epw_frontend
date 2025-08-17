import { useCart } from '../context/CartContext';

interface Product {
    price: number;
    wholesale?: number;
}

export const useWholesalePrice = (product: Product) => {
    const { cartItemCount } = useCart();
    
    const isWholesaleActive = cartItemCount >= 5;
    const currentPrice = isWholesaleActive && product.wholesale ? Number(product.wholesale) : Number(product.price);
    
    return {
        currentPrice,
        isWholesaleActive,
        hasWholesale: !!product.wholesale
    };
};