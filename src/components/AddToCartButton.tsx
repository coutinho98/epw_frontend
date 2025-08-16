import React from 'react';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { Product } from '../types/Product';
import { Variant } from '../types/Variant';
import { toast } from 'sonner';

interface AddToCartButtonProps {
    product: Product & { variants: Variant[] };
    selectedColorVariant: string | null;
    selectedSize: string | null;
    quantity: number;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    product,
    selectedColorVariant,
    selectedSize,
    quantity
}) => {
    const { addItem, cartItemCount } = useCart();
    
    const isWholesaleActive = cartItemCount >= 5;
    const currentPrice = isWholesaleActive && product.wholesale ? Number(product.wholesale) : Number(product.price);

    const handleAddToCart = () => {
        if (!selectedColorVariant || !selectedSize) {
            toast.error('Por favor, selecione cor e tamanho');
            return;
        }

        const selectedVariant = product.variants.find(
            v => v.color === selectedColorVariant && v.size === selectedSize
        );

        if (!selectedVariant) {
            toast.error('Variante não encontrada');
            return;
        }

        if (selectedVariant.stock < quantity) {
            toast.error('Quantidade não disponível em estoque');
            return;
        }

        const cartItem = {
            productId: product.id,
            productName: product.name,
            variantId: selectedVariant.id,
            color: selectedColorVariant,
            size: selectedSize,
            imageUrl: selectedVariant.imageUrls?.[0] || '',
            name: product.name,
            price: currentPrice,
            quantity,
            slug: product.slug,
        };

        addItem(cartItem);
        toast.success('Produto adicionado ao carrinho!');
    };

    return (
        <Button 
            onClick={handleAddToCart}
            className="w-full bg-white text-black hover:bg-gray-300 h-12"
            disabled={!selectedColorVariant || !selectedSize}
        >
            ADICIONAR AO CARRINHO
        </Button>
    );
};

export default AddToCartButton;