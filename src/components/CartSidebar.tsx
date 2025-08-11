import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { XIcon, ShoppingCartIcon } from 'lucide-react';

interface CartSidebarProps { }

const CartSidebar: React.FC<CartSidebarProps> = () => {
    const { cartItems, isCartOpen, toggleCart, removeItem, cartTotal, cartItemCount } = useCart();
   

    const handleCheckout = () => {
        toggleCart();
    };

    return (
        <Sheet open={isCartOpen} onOpenChange={toggleCart}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col text-white bg-black border-black">
                <SheetHeader className="p-4">
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingCartIcon className="h-6 w-6" />
                        Seu Carrinho ({cartItemCount})
                    </SheetTitle>
                    <SheetDescription className="text-white text-3xl">
                        Adicionado ao carrinho
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center text-white mt-10">
                            <p>Seu carrinho está vazio.</p>
                            <Link to="/products">
                                <Button onClick={toggleCart} className="mt-4 bg-white text-black hover:bg-gray-300">
                                    Continue Comprando
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.variantId} className="flex items-center gap-7 border-b border-black pb-4">
                                <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-30 h-30 object-cover flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <h4 className="text-lg">{item.productName}</h4>
                                    <p className="text-xs text-white">Cor: {item.color} / Tamanho: {item.size}</p>
                                    <p className="font-bold text-md">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                    <div className="flex items-center mt-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(item.variantId)}
                                            className="ml-auto text-white hover:text-red-400"
                                        >
                                            <XIcon className="h-15 w-15" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {cartItems.length > 0 && (
                    <div className="p-4 border-t border-gray-800">
                        <div className="flex justify-between items-center text-xl font-bold mb-4">
                            <span>Total:</span>
                            <span>R$ {cartTotal.toFixed(2)}</span>
                        </div>
                        <Link to="/checkout" onClick={handleCheckout} className="w-full">
                            <Button className="w-full h-12 bg-white text-black hover:bg-gray-300">
                                Finalizar Compra
                            </Button>
                        </Link>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartSidebar;