import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  complement?: string;
}

interface OrderData {
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

interface BackendOrderResponse {
  order: {
    id: string;
    userId: string;
    status: string;
    totalPrice: string;
    shippingAddress: any;
    paymentMethod: string | null;
    paymentStatus: string;
    createdAt: string;
    updatedAt: string;
    items: Array<any>;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
  payment: {
    init_point: string;
    preference_id: string;
  };
}


const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(user?.shippingAddress || {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    complement: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para finalizar o pedido.');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Seu carrinho está vazio.');
      navigate('/cart');
      return;
    }

    const orderData: OrderData = {
      items: cartItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
    };

    try {
      const apiResponse = await api.post<BackendOrderResponse>('/orders', orderData);
      const { order, payment } = apiResponse;

      if (payment && payment.init_point) {
        toast.success('Pedido criado com sucesso! Abrindo página de pagamento...');
        clearCart();

        window.open(payment.init_point, '_blank');

      } else {
        throw new Error('Falha ao obter URL de pagamento do Mercado Pago na resposta.');
      }
    } catch (error: any) {
      console.error('Erro ao criar o pedido:', error);
      const errorMessage = error.message || 'Tente novamente.';
      toast.error(`Erro ao criar o pedido. ${errorMessage}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

      <form onSubmit={handleCreateOrder}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Endereço de Entrega</h2>
          <div className="grid gap-2">
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              value={shippingAddress.street}
              onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              value={shippingAddress.zipCode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
              required
              placeholder="Ex: 00000-000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="complement">Complemento (opcional)</Label>
            <Input
              id="complement"
              value={shippingAddress.complement}
              onChange={(e) => setShippingAddress({ ...shippingAddress, complement: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Resumo do Pedido</h2>
          <p className="mt-2">Total: R$ {cartTotal.toFixed(2)}</p>
          <div className="mt-4">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Input
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button type="submit">
            Confirmar e Pagar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;