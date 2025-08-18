import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

interface ShippingAddress {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  document: string;
  complement?: string;
  phone?: string;
}

interface OrderData {
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  shippingServiceId?: string;
  shippingPrice?: number;
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
    shippingServiceId: string | null;
    shippingPrice: number | null;
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

interface ShippingQuote {
  id: string;
  name: string;
  price: number;
  company: {
    name: string;
    picture: string;
  };
  delivery_time: number;
}

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(user?.shippingAddress as ShippingAddress || {
    street: '',
    number: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    document: '',
    complement: '',
    phone: '',
  });

  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [hasCalculatedShipping, setHasCalculatedShipping] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  useEffect(() => {
    if (cartItems.length > 0) {
      toast.warning('Você tem itens no seu carrinho que ainda não foram comprados.', {
        id: 'checkout-warning',
        duration: 5000,
      });
    }
  }, [cartItems]);

  const handleCalculateShipping = async () => {
    if (!shippingAddress.zipCode) {
      toast.error('Por favor, insira o CEP para calcular o frete.');
      return;
    }

    setIsCalculating(true);
    setShippingQuotes([]);
    setShippingError(null);

    const quotePayload = {
      fromZipCode: '01000-000',
      toZipCode: shippingAddress.zipCode,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await api.post<ShippingQuote[]>('/orders/shipping-quote', quotePayload);
      if (response && Array.isArray(response) && response.length > 0) {
        setShippingQuotes(response);
        setSelectedShipping(response[0].id);
      } else {
        setShippingError('Nenhuma opção de frete encontrada para este CEP.');
      }
      setHasCalculatedShipping(true);
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error);
      setShippingError(error.data?.message || error.message || 'Falha ao calcular o frete.');
      toast.error(error.data?.message || error.message || 'Falha ao calcular o frete.');
    } finally {
      setIsCalculating(false);
    }
  };

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

    if (!selectedShipping) {
      toast.error('Por favor, selecione uma opção de frete.');
      return;
    }

    const selectedQuote = shippingQuotes.find(q => q.id === selectedShipping);
    if (!selectedQuote) {
      toast.error('Opção de frete inválida.');
      return;
    }

    const orderData: OrderData = {
      items: cartItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      shippingAddress: shippingAddress,
      shippingServiceId: selectedQuote.id,
      shippingPrice: selectedQuote.price,
    };

    try {
      const apiResponse = await api.post<BackendOrderResponse>('/orders', orderData);
      const { payment } = apiResponse;

      if (payment && payment.init_point) {
        toast.success('Pedido criado com sucesso! Abrindo página de pagamento...');
        clearCart();

        window.open(payment.init_point, '_blank');

      } else {
        throw new Error('Falha ao obter URL de pagamento do Mercado Pago na resposta.');
      }
    } catch (error: any) {
      console.error('Erro ao criar o pedido:', error);
      const errorMessage = error.data?.message || error.message || 'Tente novamente.';
      toast.error(`Erro ao criar o pedido. ${errorMessage}`);
    }
  };

  const selectedShippingPrice = shippingQuotes.find(q => q.id === selectedShipping)?.price || 0;
  const finalTotal = cartTotal + selectedShippingPrice;

  return (
    <div className="container mx-auto p-8 max-w-2xl bg-white text-black">
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
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              value={shippingAddress.number}
              onChange={(e) => setShippingAddress({ ...shippingAddress, number: e.target.value })}
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
            <div className="flex gap-2">
              <Input
                id="zipCode"
                value={shippingAddress.zipCode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                required
                placeholder="Ex: 00000-000"
              />
              <Button type="button" onClick={handleCalculateShipping} disabled={isCalculating} className='bg-black text-white hover:bg-gray-800'>
                {isCalculating ? 'Calculando...' : 'Calcular Frete'}
              </Button>
            </div>
          </div>
          {hasCalculatedShipping && (
            <div className="space-y-2 mt-4">
              <h3 className="font-semibold">Opções de Frete</h3>
              {shippingError ? (
                <p className="text-red-500">{shippingError}</p>
              ) : (
                <RadioGroup onValueChange={setSelectedShipping} value={selectedShipping || undefined}>
                  {shippingQuotes.map((quote) => (
                    <div key={quote.id} className="flex items-center space-x-3 p-3 border rounded-md">
                      <RadioGroupItem value={quote.id} id={quote.id} />
                      <Label htmlFor={quote.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span>{quote.company.name} - {quote.name}</span>
                          <span className="font-bold">R$ {quote.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-500">Prazo de entrega: {quote.delivery_time} dias úteis</p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          )}
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
            <Label htmlFor="document">CPF/CNPJ</Label>
            <Input
              id="document"
              value={shippingAddress.document}
              onChange={(e) => setShippingAddress({ ...shippingAddress, document: e.target.value })}
              required
              placeholder="Ex: 000.000.000-00"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input
              id="phone"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              placeholder="Ex: (00) 90000-0000"
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

        <Separator className="my-8" />

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Resumo do Pedido</h2>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Frete:</span>
              <span>{selectedShipping ? `R$ ${selectedShippingPrice.toFixed(2)}` : 'Aguardando cálculo'}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total Final:</span>
              <span>R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex">
          <Button
            type="submit"
            className='flex-grow bg-white text-black py-6 text-sm cursor-pointer hover:bg-gray-300'
            disabled={!selectedShipping}
          >
            Confirmar e Pagar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;