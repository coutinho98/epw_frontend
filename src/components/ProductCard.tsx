import { useState } from 'react';
import { Product } from '../types/Product';
import { Variant } from '../types/Variant';
import { Link } from 'react-router-dom';
import ColorVariantDot from './ColorVariantDot';

interface ProductCardProps {
    product: Product & { variants: Variant[] };
}

const ProductCard = ({ product }: ProductCardProps) => {

    const allVariants = [
        {
            id: product.id,
            color: product.color || '#CCCCCC',
            imageUrls: product.mainImageUrl,
        } as Variant,
        ...product.variants
    ];

    const uniqueVariants = allVariants.filter((variant: Variant, index: number, self: Variant[]) =>
        index === self.findIndex((v) => v.color === variant.color)
    );

    const [mainImage, setMainImage] = useState(product.mainImageUrl?.[0] || '');
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(uniqueVariants?.[0]?.id || null);

    const handleVariantClick = (variant: Variant) => {
        setSelectedVariantId(variant.id);
        const selectedImage = variant.imageUrls?.[0] || product.mainImageUrl?.[0] || '';
        setMainImage(selectedImage);
    };

    const handleImageHover = () => {
        const selectedVariant = uniqueVariants.find((v: Variant) => v.id === selectedVariantId);
        if (selectedVariant && selectedVariant.imageUrls?.length > 1) {
            setMainImage(selectedVariant.imageUrls[1]);
        }
    };

    const handleImageLeave = () => {
        const selectedVariant = uniqueVariants.find((v: Variant) => v.id === selectedVariantId);
        if (selectedVariant) {
            setMainImage(selectedVariant.imageUrls?.[0] || product.mainImageUrl?.[0] || '');
        } else {
            setMainImage(product.mainImageUrl?.[0] || '');
        }
    };

    const handleVariantHover = (variant: Variant) => {
        setMainImage(variant.imageUrls?.[0] || variant.imageUrls?.[0] || product.mainImageUrl?.[0] || '');
    };

    const handleVariantLeave = () => {
        const selectedVariant = uniqueVariants.find(v => v.id === selectedVariantId);
        if (selectedVariant) {
            setMainImage(selectedVariant.imageUrls?.[0] || product.mainImageUrl?.[0] || '');
        } else {
            setMainImage(product.mainImageUrl?.[0] || '');
        }
    };

    const remainingColors = uniqueVariants.length - 3;

    return (
        <div className="flex flex-col items-center w-full max-w-sm lg:mr-20">
            <Link to={`/products/${product.slug}`} className="w-full">
                <div
                    className="relative w-full aspect-[3/4]"
                    onMouseEnter={handleImageHover}
                    onMouseLeave={handleImageLeave}
                >
                    <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            </Link>
            <div className="mt-2 text-center">
                <h3 className="text-white line-clamp-1">{product.name}</h3>
                <p className="text-white font-bold">R${product.price.toFixed(2)}</p>
            </div>
            {uniqueVariants.length > 0 && (
                <div className="flex items-center space-x-2 mt-4 mb-30">
                    {uniqueVariants.slice(0, 3).map((variant) => (
                        <ColorVariantDot
                            key={variant.id}
                            color={variant.color}
                            isSelected={selectedVariantId === variant.id}
                            onClick={() => handleVariantClick(variant)}
                            onMouseEnter={() => handleVariantHover(variant)}
                            onMouseLeave={handleVariantLeave}
                        />
                    ))}
                    {remainingColors > 0 && (
                        <div className="w-6 h-6 text-white flex items-center justify-center text-sm">
                            +{remainingColors}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductCard;