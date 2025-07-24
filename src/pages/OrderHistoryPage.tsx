import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

const OrderHistoryPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get('/orders');

                if (response && Array.isArray(response)) {
                    setOrders(response);
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
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Carregando histórico de pedidos...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Seu Histórico de Pedidos</h1>

            {orders.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum pedido encontrado.</p>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader>
                                <CardTitle>Pedido #{order.id.slice(0, 8)}</CardTitle>
                                <CardDescription>
                                    Data: {new Date(order.createdAt).toLocaleDateString()} | Total: R$ {parseFloat(order.totalPrice).toFixed(2)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produto</TableHead>
                                            <TableHead>Quantidade</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>Produto ID: {item.productId.slice(0, 8)}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{order.status}</TableCell>
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