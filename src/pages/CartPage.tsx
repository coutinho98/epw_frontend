import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { MinusIcon, PlusIcon, XIcon } from 'lucide-react';

const CartPage: React.FC = () => {
    const { cartItems, removeItem, updateItemQuantity, cartTotal, cartItemCount } = useCart();

    const handleQuantityChange = (variantId: string, currentQuantity: number, delta: number) => {
        updateItemQuantity(variantId, currentQuantity + delta);
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto p-4 md:p-8 text-white min-h-[calc(100vh-120px)] flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold mb-4">Seu Carrinho está Vazio</h2>
                <p className="text-gray-400 mb-8">Parece que você ainda não adicionou nenhum item.</p>
                <Link to="/products">
                    <Button className="bg-white text-black hover:bg-gray-300">
                        Voltar para Compras
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 text-white min-h-[calc(100vh-120px)]">
            <h1 className="text-3xl lg:text-4xl font-bold mb-8">
                Seu Carrinho ({cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'}) - R$ {cartTotal.toFixed(2)}
            </h1>

            {/* Layout para desktop */}
            <Table className="cart-table-desktop">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] text-white">Produto</TableHead>
                        <TableHead className='text-white'>Detalhes</TableHead>
                        <TableHead className="text-center text-white">Preço</TableHead>
                        <TableHead className="text-center text-white">Quantidade</TableHead>
                        <TableHead className="text-right text-white">Subtotal</TableHead>
                        <TableHead className="text-right text-white">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cartItems.map((item) => (
                        <TableRow key={item.variantId}>
                            <TableCell>
                                <img src={item.imageUrl} alt={item.productName} className="w-16 h-16 object-cover rounded-md" />
                            </TableCell>
                            <TableCell>
                                <div className="">{item.productName}</div>
                                <div className="text-sm ">{item.color}, {item.size}</div>
                            </TableCell>
                            <TableCell className="text-center">R$ {item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuantityChange(item.variantId, item.quantity, -1)}
                                        className="px-2 py-1 h-8 text-white bg-zinc-900 hover:bg-zinc-800 border-gray-700"
                                        disabled={item.quantity <= 1}
                                    >
                                        <MinusIcon className="h-4 w-4" />
                                    </Button>
                                    <span className="mx-2">{item.quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuantityChange(item.variantId, item.quantity, 1)}
                                        className="px-2 py-1 h-8 text-white bg-zinc-900 hover:bg-zinc-800 border-gray-700"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-bold">R$ {(item.price * item.quantity).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(item.variantId)}
                                    className="text-red-500 hover:text-red-400"
                                >
                                    <XIcon className="h-5 w-5" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Layout para mobile */}
            <div className="cart-list-mobile">
                {cartItems.map((item) => (
                    <div key={item.variantId} className="cart-item-mobile">
                        <div className="mobile-item-header">
                            <img src={item.imageUrl} alt={item.productName} className="w-35 h-35 object-cover" />
                            <div className="font-semibold">{item.productName}</div>
                        </div>
                        <div className="mobile-item-details text-sm">
                            <div>{item.color}, {item.size}</div>
                            <div className='mt-2'>R${item.price.toFixed(2)}</div>
                        </div>
                        <div className="mobile-item-quantity">
                            Quantidade:
                            <div className="flex items-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.variantId, item.quantity, -1)}
                                    className="px-2 py-1 h-8 text-white bg-zinc-900 hover:bg-zinc-800 border-gray-700"
                                    disabled={item.quantity <= 1}
                                >
                                    <MinusIcon className="h-4 w-4" />
                                </Button>
                                <span className="mx-2">{item.quantity}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.variantId, item.quantity, 1)}
                                    className="px-2 py-1 h-8 text-white bg-zinc-900 hover:bg-zinc-800 border-gray-700"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="mobile-item-subtotal">
                            Subtotal: R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="mobile-item-actions">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.variantId)}
                                className="text-red-500 hover:text-red-400"
                            >
                                <XIcon className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-4 p-4 border-t border-gray-800 md:flex-row flex-col-reverse md:gap-0 gap-4">
                <Link to="/products">
                    <Button variant="outline" className="bg-transparent border-white text-white hover:bg-zinc-900 w-full md:w-auto">
                        Continuar Comprando
                    </Button>
                </Link>
                <div className="text-right w-full md:w-auto">
                    <div className="text-lg font-semibold">Total do Carrinho: R$ {cartTotal.toFixed(2)}</div>
                    <Button className="bg-white text-black hover:bg-gray-300 mt-2 w-full md:w-auto">
                        Prosseguir para o Checkout
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;