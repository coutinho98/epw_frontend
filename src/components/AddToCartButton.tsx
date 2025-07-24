import { Button } from './ui/button';
import { Product } from '../types/Product';
import { Variant } from '../types/Variant';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types/Cart';
import { toast } from 'sonner';

interface AddToCartButtonProps {
    product: Product & { variants: Variant[] } | null;
    selectedColorVariant: string | null;
    selectedSize: string | null;
    quantity: number;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    product,
    selectedColorVariant,
    selectedSize,
    quantity,
}) => {
    const { addItem } = useCart();

    const handleAddToCart = () => {
        if (!product) {
            toast.error("Erro: Produto não encontrado.");
            return;
        }

        const finalSelectedVariant = product.variants.find(
            v => v.color === selectedColorVariant && v.size === selectedSize
        );

        if (!finalSelectedVariant) {
            toast.error('Por favor, selecione uma cor e um tamanho válidos.');
            return;
        }

        const itemToAdd: CartItem = {
            productId: product.id,
            productName: product.name,
            variantId: finalSelectedVariant.id,
            color: finalSelectedVariant.color,
            size: finalSelectedVariant.size,
            slug: product.slug, 
            imageUrl: finalSelectedVariant.imageUrls?.[0] || product.mainImageUrl?.[0] || '', 
            name: product.name,
            price: product.price + finalSelectedVariant.additionalPrice,
            quantity: quantity,
        };

        addItem(itemToAdd); 

        toast.success(`${itemToAdd.productName} (${itemToAdd.size}, ${itemToAdd.color}) adicionado ao carrinho!`, {
            description: `Quantidade: ${itemToAdd.quantity} - Total: R$${(itemToAdd.price * itemToAdd.quantity).toFixed(2)}`,
            duration: 3000, 
        });
        
        console.log(`Item adicionado ao carrinho:`, itemToAdd);
    };

    return (
        <Button
            onClick={handleAddToCart}
            className="flex-grow bg-white text-black py-6 text-sm cursor-pointer hover:bg-gray-300"
            disabled={!selectedColorVariant || !selectedSize || quantity < 1}
        >
            Adicionar ao Carrinho
        </Button>
    );
};

export default AddToCartButton;