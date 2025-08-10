import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product } from '@/types/Product';
import { Variant } from '@/types/Variant';
import { Link } from 'react-router-dom';

interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    variantId: string;
    quantity: number;
}

interface Order {
    id: string;
    createdAt: string;
    totalPrice: string;
    paymentStatus: string;
    status: string;
    items: OrderItem[];
    shippingAddress: {
        street: string;
        city: string;
    };
}

interface EnrichedOrderItem extends OrderItem {
    product?: Product;
    variant?: Variant;
}

interface EnrichedOrder extends Order {
    items: EnrichedOrderItem[];
}

const OrderHistoryPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<EnrichedOrder[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const productsResponse = await api.get<Product[]>('/products');
                if (productsResponse) {
                    setAllProducts(productsResponse);
                }
            } catch (err) {
                console.error('Falha ao buscar todos os produtos:', err);
                toast.error('Não foi possível carregar a lista de produtos.');
            }
        };
        fetchAllProducts();
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || allProducts.length === 0) {
                if (allProducts.length > 0) {
                    setLoading(false);
                }
                return;
            }
            try {
                const fetchedOrders = await api.get<Order[]>('/orders');
                if (fetchedOrders && Array.isArray(fetchedOrders)) {
                    const enrichedOrders = await Promise.all(
                        fetchedOrders.map(async (order) => {
                            const enrichedItems = await Promise.all(
                                order.items.map(async (item) => {
                                    const product = allProducts.find(p => p.id === item.productId);
                                    let variant: Variant | undefined;
                                    try {
                                        variant = await api.get<Variant>(`/variants/${item.variantId}`);
                                    } catch (itemError) {
                                        console.error('Falha ao buscar detalhes da variação:', itemError);
                                    }
                                    return { ...item, product, variant };
                                })
                            );
                            return { ...order, items: enrichedItems };
                        })
                    );
                    setOrders(enrichedOrders);
                } else {
                    throw new Error('Falha ao buscar pedidos.');
                }
            } catch (error) {
                console.error('Erro ao buscar histórico de pedidos:', error);
                toast.error('Não foi possível carregar seu histórico de pedidos.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user, allProducts]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-white">
                <p className="animate-pulse text-lg">Carregando histórico de pedidos...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 md:p-10 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-10 bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
                Seu Histórico de Pedidos
            </h1>

            {orders.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-lg">Nenhum pedido encontrado.</p>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => (
                        <Card 
                            key={order.id} 
                            className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <CardHeader className="border-b border-white/10 pb-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <CardTitle className="text-white">Pedido #{order.id.slice(0, 8)}</CardTitle>
                                        <CardDescription className="text-gray-300">
                                            {new Date(order.createdAt).toLocaleDateString()} | Total: R$ {parseFloat(order.totalPrice).toFixed(2)}
                                        </CardDescription>
                                    </div>
                                    <span
                                        className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-semibold ${
                                            order.status === 'pending'
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-green-500/20 text-green-400'
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-white/10">
                                            <TableHead className="text-gray-200">Produto</TableHead>
                                            <TableHead className="text-gray-200">Cor</TableHead>
                                            <TableHead className="text-gray-200">Tamanho</TableHead>
                                            <TableHead className="text-gray-200">Quantidade</TableHead>
                                            <TableHead className="text-gray-200 text-right">Preço Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item) => (
                                            <TableRow 
                                                key={item.id} 
                                                className="hover:bg-white/5 transition-colors"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        {item.product?.mainImageUrl?.[0] && (
                                                            <img
                                                                src={item.product.mainImageUrl[0]}
                                                                alt={item.product.name}
                                                                className="w-14 h-14 object-cover rounded-lg border border-white/10"
                                                            />
                                                        )}
                                                        <Link 
                                                            to={`/products/${item.product?.slug}`} 
                                                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                                        >
                                                            {item.product?.name || 'Produto não encontrado'}
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                                <TableCell className='text-white'>{item.variant?.color || '-'}</TableCell>
                                                <TableCell className='text-white'>{item.variant?.size || '-'}</TableCell>
                                                <TableCell className='text-white'>{item.quantity}</TableCell>
                                                <TableCell className="text-right text-white">
                                                    R$ {((item.variant?.additionalPrice || 0) + (item.product?.price || 0) * item.quantity).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
