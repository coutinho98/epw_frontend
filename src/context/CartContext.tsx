import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { CartItem, CartContextType } from '@/types/Cart'

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const storedCartItems = localStorage.getItem('shopping_cart');
            return storedCartItems ? JSON.parse(storedCartItems) : [];
        } catch (error) {
            console.error("falha ao carregar no local", error);
            return [];
        }
    })

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('shopping_cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error("falha ao enviar para o local.", error);
        }
    }, [cartItems]);

    const addItem = (itemToAdd: CartItem) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(
                item => item.variantId === itemToAdd.variantId
            );

            if (existingItemIndex > -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + itemToAdd.quantity
                };
                return updatedItems;
            } else {
                return [...prevItems, itemToAdd];
            }
        });
        setIsCartOpen(true);
    }

    const removeItem = (variantId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
    };

    const updateItemQuantity = (variantId: string, quantity: number) => {
        setCartItems(prevItems => {
            const updatedItems = prevItems.map(item =>
                item.variantId === variantId ? { ...item, quantity } : item
            );
            // Remove itens com quantidade 0 ou menos
            return updatedItems.filter(item => item.quantity > 0);
        });
    }
    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
    }

    const clearCart = () => {
        setCartItems([]);
        setIsCartOpen(false);
    }

    const cartTotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cartItems]);

    const cartItemCount = useMemo(() => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }, [cartItems]);

    const contextValue = useMemo(() => ({
        cartItems,
        isCartOpen,
        addItem,
        removeItem,
        updateItemQuantity,
        toggleCart,
        clearCart,
        cartTotal,
        cartItemCount,
    }), [cartItems, isCartOpen, addItem, removeItem, updateItemQuantity, toggleCart, clearCart, cartTotal, cartItemCount]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
