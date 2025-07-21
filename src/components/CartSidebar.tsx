import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { XIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from 'lucide-react'; 

interface CartSidebarProps {}

const CartSidebar: React.FC<CartSidebarProps> = () => {
    const { cartItems, isCartOpen, toggleCart, removeItem, updateItemQuantity, cartTotal, cartItemCount } = useCart();

    const handleQuantityChange = (variantId: string, currentQuantity: number, delta: number) => {
        updateItemQuantity(variantId, currentQuantity + delta);
    };

    return (
        <Sheet open={isCartOpen} onOpenChange={toggleCart}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-black text-white border-black">
                <SheetHeader className="p-4">
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingCartIcon className="h-6 w-6" />
                        Seu Carrinho ({cartItemCount})
                    </SheetTitle>
                    <SheetDescription className="text-gray-400">
                        Adicionado ao carrinho
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">
                            <p>Seu carrinho está vazio.</p>
                            <Link to="/products">
                                <Button onClick={toggleCart} className="mt-4 bg-gray-700 text-white hover:bg-gray-600">
                                    Continue Comprando
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.variantId} className="flex items-center gap-4 border-b border-gray-800 pb-4 last:border-b-0">
                                <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-lg">{item.productName}</h4>
                                    <p className="text-sm text-gray-400">Cor: {item.color} / Tamanho: {item.size}</p>
                                    <p className="font-bold text-md">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                    <div className="flex items-center mt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuantityChange(item.variantId, item.quantity, -1)}
                                            className="px-2 py-1 h-8 text-white bg-zinc-900 hover:bg-zinc-800 border-gray-700"
                                            disabled={item.quantity <= 1}
                                        >
                                            <MinusIcon className="h-4 w-4" />
                                        </Button>
                                        <span className="mx-2 text-lg">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuantityChange(item.variantId, item.quantity, 1)}
                                            className="px-2 py-1 h-8 text-white bg-zinc-900 hover:bg-zinc-800 border-gray-700"
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(item.variantId)}
                                            className="ml-auto text-red-500 hover:text-red-400"
                                        >
                                            <XIcon className="h-10 w-10" />
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
                        <Button className="w-full h-12 bg-white text-black hover:bg-gray-300">
                            Finalizar Compra
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartSidebar;