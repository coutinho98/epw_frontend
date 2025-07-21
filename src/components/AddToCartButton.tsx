import { Button } from './ui/button';
import { Product } from '../types/Product';
import { Variant } from '../types/Variant';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types/Cart';

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
        if (!product) return;

        const finalSelectedVariant = product.variants.find(
            v => v.color === selectedColorVariant && v.size === selectedSize
        );

        if (!finalSelectedVariant) {
            return;
        }

        const itemToAdd: CartItem = {
            productId: product.id,
            productName: product.name,
            variantId: finalSelectedVariant.id,
            color: finalSelectedVariant.color,
            size: finalSelectedVariant.size,
            imageUrl: finalSelectedVariant.imageUrls?.[0] || product.mainImageUrl?.[0] || '', 
            price: product.price + finalSelectedVariant.additionalPrice,
            quantity: quantity,
        };

        addItem(itemToAdd); 

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