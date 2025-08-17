export interface CartItem {
    productId: string;
    productName: string;
    variantId: string;
    color: string;
    size: string;
    imageUrl: string;
    name: string;
    price: number;
    retailPrice: number; 
    wholesalePrice?: number; 
    quantity: number;
    slug: string;
}

export interface CartContextType {
    cartItems: CartItem[];
    isCartOpen: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (variantId: string) => void;
    updateItemQuantity: (variantId: string, quantity: number) => void;
    toggleCart: () => void;
    clearCart: () => void;
    cartTotal: number;
    cartItemCount: number;
}