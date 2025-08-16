import { useCart } from '../context/CartContext';

interface Product {
    price: number;
    wholesale?: number;
}

export const useWholesalePrice = (product: Product) => {
    const { cartItemCount } = useCart();
    
    const isWholesaleActive = cartItemCount >= 5;
    const currentPrice = isWholesaleActive && product.wholesale ? product.wholesale : product.price;
    
    return {
        currentPrice,
        isWholesaleActive,
        hasWholesale: !!product.wholesale
    };
};