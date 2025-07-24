import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import ProductQuantitySelector from '@/components/ProductQuantitySelector';

const CartPage = () => {
    const { cartItems, cartTotal, removeItem, updateItemQuantity } = useCart();
    const navigate = useNavigate();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckoutNavigation = () => {
        if (cartItems.length === 0) {
            toast.error('Seu carrinho está vazio.');
            return;
        }
        navigate('/checkout');
    };

    const renderDesktopLayout = () => (
        <>
            <div className="overflow-x-auto">
                <Table className='border-none min-w-full'>
                    <TableCaption>Uma lista dos produtos em seu carrinho.</TableCaption>
                    <TableHeader>
                        <TableRow className='border-none'>
                            <TableHead className="w-[300px] sm:w-[400px] text-foreground font-semibold text-white">Item</TableHead>
                            <TableHead className='text-right text-foreground font-semibold flex justify-end items-center text-white'>Quantidade</TableHead>
                            <TableHead className='text-right text-foreground font-semibold text-white'>Preço</TableHead>
                            <TableHead className='border-none w-[50px]'></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cartItems.map((item) => (
                            <TableRow key={item.variantId} className="items-center border-none">
                                <TableCell className='border-none'>
                                    <Link
                                        to={`/products/${item.slug}`}
                                        className="flex items-center space-x-2 sm:space-x-4"
                                    >
                                        <img
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 object-contain flex-shrink-0"
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm sm:text-base truncate">{item.productName}</span>
                                            <span className="text-sm sm:text-base text-muted-foreground text-white">
                                                Cor: {item.color}, {item.size}
                                            </span>
                                        </div>
                                    </Link>
                                </TableCell>
                                <TableCell className='text-right border-none'>
                                    <div className="flex justify-end">
                                        <ProductQuantitySelector
                                            quantity={item.quantity}
                                            onQuantityChange={(newQuantity) => updateItemQuantity(item.variantId, newQuantity)}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className='text-right text-sm sm:text-base border-none whitespace-nowrap'>
                                    R$ {item.price.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right border-none">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItem(item.variantId)}
                                        className="h-8 w-8 p-0"
                                    >
                                        X
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-6 sm:mt-8 flex justify-end items-center text-lg sm:text-xl font-bold">
                <span className="mr-4">Total:</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
            </div>

            <div className="mt-6 sm:mt-8 flex justify-end">
                <Button onClick={handleCheckoutNavigation} className="w-full sm:w-auto">
                    Finalizar Pedido
                </Button>
            </div>
        </>
    );

    const renderMobileLayout = () => (
        <div className="space-y-4 sm:space-y-6">
            {cartItems.map((item) => (
                <div key={item.variantId} className="flex space-x-3 sm:space-x-4 pb-4 last:border-b-0">
                    <Link to={`/products/${item.slug}`} className="flex-shrink-0">
                        <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="h-24 w-24 sm:h-28 sm:w-28 object-contain"
                        />
                    </Link>
                    <div className="flex-grow flex flex-col space-y-2 min-w-0">
                        <Link to={`/products/${item.slug}`} className="text-sm sm:text-base truncate">
                            {item.productName}
                        </Link>
                        <span className="text-sm sm:text-base text-muted-foreground text-white">
                            {item.color}, {item.size}
                        </span>

                        <span className="text-sm sm:text-base font-semibold">R$ {item.price.toFixed(2)}</span>

                        <div className="flex items-center justify-between mt-2">
                            <ProductQuantitySelector
                                quantity={item.quantity}
                                onQuantityChange={(newQuantity) => updateItemQuantity(item.variantId, newQuantity)}
                            />
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex items-start">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.variantId)}
                            className="h-8 w-8 p-0"
                        >
                            X
                        </Button>
                    </div>
                </div>
            ))}
            <div className="mt-6 sm:mt-8 flex flex-col items-end space-y-4">
                <div className="flex justify-between w-full text-lg sm:text-xl font-bold">
                    <span>Total:</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <Button onClick={handleCheckoutNavigation} className="w-full">
                    Finalizar Pedido
                </Button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-7xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl mb-6 sm:mb-8 font-bold">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'} no seu carrinho por R$ {cartTotal.toFixed(2)}
            </h1>

            {cartItems.length > 0 ? (
                isMobile ? renderMobileLayout() : renderDesktopLayout()
            ) : (
                <p className="text-center text-gray-500 py-8">Seu carrinho está vazio.</p>
            )}
        </div>
    );
};

export default CartPage;