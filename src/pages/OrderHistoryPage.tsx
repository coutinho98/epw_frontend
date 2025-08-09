import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product } from '@/types/Product';
import { Variant } from '@/types/Variant';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

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
                <p>Carregando histórico de pedidos...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 text-white">
            <h1 className="text-3xl font-bold mb-8">Seu Histórico de Pedidos</h1>
            {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum pedido encontrado.</p>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id} className="bg-zinc-800 border-zinc-700">
                            <CardHeader className="border-b border-zinc-700">
                                <CardTitle className="text-white">Pedido #{order.id.slice(0, 8)}</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Data: {new Date(order.createdAt).toLocaleDateString()} | Total: R$ {parseFloat(order.totalPrice).toFixed(2)}
                                </CardDescription>
                                <span className={`text-sm font-semibold ${order.status === 'pending' ? 'text-yellow-400' : 'text-green-400'}`}>
                                    Status: {order.status}
                                </span>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-zinc-700">
                                            <TableHead className="text-white">Produto</TableHead>
                                            <TableHead className="text-white">Cor</TableHead>
                                            <TableHead className="text-white">Tamanho</TableHead>
                                            <TableHead className="text-white">Quantidade</TableHead>
                                            <TableHead className="text-white text-right">Preço Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item) => (
                                            <TableRow key={item.id} className="text-white">
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        {item.product?.mainImageUrl?.[0] && (
                                                            <img
                                                                src={item.product.mainImageUrl[0]}
                                                                alt={item.product.name}
                                                                className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                                                            />
                                                        )}
                                                        <Link to={`/products/${item.product?.slug}`} className="text-blue-400 hover:underline">
                                                            {item.product?.name || 'Produto não encontrado'}
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{item.variant?.color || '-'}</TableCell>
                                                <TableCell>{item.variant?.size || '-'}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell className="text-right">
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