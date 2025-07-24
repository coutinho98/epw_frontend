// src/pages/CheckoutPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Definição das interfaces
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

// Interface para a resposta da API, com o campo 'id'
interface OrderResponse {
  id: string;
  // Outras propriedades que a API de orders retorna podem ser adicionadas aqui
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
      const response = await api.post('/orders', orderData);

      // Usamos a asserção de tipo e a navegação segura
      const order = response as OrderResponse;
      if (order?.id) {
        toast.success('Pedido criado com sucesso!');
        clearCart();
        navigate('/orders-history');
      } else {
        throw new Error('Falha ao criar o pedido.');
      }
    } catch (error) {
      console.error('Erro ao criar o pedido:', error);
      toast.error('Erro ao criar o pedido. Tente novamente.');
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