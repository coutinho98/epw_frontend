import { Button } from './ui/button';
import { Product } from '../types/Product';
import { Variant } from '@/types/Variant';

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
    const handleAddToCart = () => {
        if (!product) return;

        const finalSelectedVariant = product.variants.find(
            v => v.color === selectedColorVariant && v.size === selectedSize
        );

        if (!finalSelectedVariant) {
            alert('Por favor, selecione uma cor e um tamanho válidos.');
            return;
        }
        //teste
        alert(`Adicionado ao carrinho:\n\nProduto: ${product.name}\nCor: ${finalSelectedVariant.color}\nTamanho: ${finalSelectedVariant.size}\nPreço: R$${product.price.toFixed(2)}\nQuantidade: ${quantity}`);

        console.log(`Adicionado ao carrinho: ${product.name}, ID da Variante: ${finalSelectedVariant.id}, Cor: ${finalSelectedVariant.color}, Tamanho: ${finalSelectedVariant.size}, Quantidade: ${quantity}`);
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