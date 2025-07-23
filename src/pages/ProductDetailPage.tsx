import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types/Product';
import { Variant } from '../types/Variant';
import api from '../services/api';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductVariantSelector from '../components/ProductVariantSelector';
import ProductQuantitySelector from '../components/ProductQuantitySelector';
import AddToCartButton from '../components/AddToCartButton';

const ProductDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [product, setProduct] = useState<(Product & { variants: Variant[] }) | null>(null);
    const [selectedColorVariant, setSelectedColorVariant] = useState<string | null>(null);
    const [availableSizesForColor, setAvailableSizesForColor] = useState<string[]>([]);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [imagesToDisplay, setImagesToDisplay] = useState<string[]>([]);

    const allPossibleSizes = ['PP', 'P', 'M', 'G',];

    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) {
                setError('Slug do produto não fornecido.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const fetchedProduct = await api.get<Product & { variants: Variant[] }>(`/products/${slug}`);
                console.log('Produto buscado da API:', fetchedProduct);

                if (fetchedProduct) {
                    setProduct(fetchedProduct);

                    const uniqueColors = new Map<string, Variant>();
                    if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
                        fetchedProduct.variants.forEach(variant => {
                            if (!uniqueColors.has(variant.color)) {
                                uniqueColors.set(variant.color, variant);
                            }
                        });
                    } else if (fetchedProduct.color) {
                        uniqueColors.set(fetchedProduct.color, {
                            id: fetchedProduct.id,
                            color: fetchedProduct.color,
                            imageUrls: fetchedProduct.mainImageUrl,
                            size: '',
                            productId: fetchedProduct.id, sku: '', stock: 0, additionalPrice: 0, createdAt: '', updatedAt: ''
                        });
                    }

                    const firstUniqueColorVariant = uniqueColors.values().next().value;
                    if (firstUniqueColorVariant) {
                        setSelectedColorVariant(firstUniqueColorVariant.color);
                        const sizesForFirstColor = Array.from(new Set(
                            fetchedProduct.variants
                                .filter(v => v.color === firstUniqueColorVariant.color)
                                .map(v => v.size)
                        )).sort();

                        setAvailableSizesForColor(sizesForFirstColor);

                        const imagesForInitialColor: string[] = [];
                        fetchedProduct.variants
                            .filter(v => v.color === firstUniqueColorVariant.color)
                            .forEach(v => {
                                if (v.imageUrls && v.imageUrls.length > 0) {
                                    imagesForInitialColor.push(...v.imageUrls);
                                }
                            });

                        const uniqueInitialImages = Array.from(new Set(imagesForInitialColor));

                        if (uniqueInitialImages.length > 0) {
                            setImagesToDisplay(uniqueInitialImages);
                        } else if (fetchedProduct.mainImageUrl && fetchedProduct.mainImageUrl.length > 0) {
                            setImagesToDisplay(fetchedProduct.mainImageUrl);
                        } else {
                            setImagesToDisplay([]);
                        }

                        if (sizesForFirstColor.length > 0) {
                            setSelectedSize(sizesForFirstColor[0]);
                        } else {
                            setSelectedSize(null); 
                        }
                    } else {
                        setImagesToDisplay((fetchedProduct.mainImageUrl && fetchedProduct.mainImageUrl) || []);
                        setAvailableSizesForColor([]);
                        setSelectedSize(null);
                    }
                } else {
                    setError('Produto não encontrado.');
                    setProduct(null);
                }
            } catch (err: any) {
                console.error('Erro ao buscar produto:', err);
                setError(err.message || 'Falha ao carregar o produto.');
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    useEffect(() => {
        if (product && selectedColorVariant) {
            const variantsOfSelectedColor = product.variants.filter(v => v.color === selectedColorVariant);
            const sizes = [...new Set(variantsOfSelectedColor.map(v => v.size))].sort();
            setAvailableSizesForColor(sizes);

            const imagesForSelectedColor: string[] = [];
            variantsOfSelectedColor.forEach(v => {
                if (v.imageUrls && v.imageUrls.length > 0) {
                    imagesForSelectedColor.push(...v.imageUrls);
                }
            });

            const uniqueImages = Array.from(new Set(imagesForSelectedColor));

            if (uniqueImages.length > 0) {
                setImagesToDisplay(uniqueImages);
            } else if (product.mainImageUrl && product.mainImageUrl.length > 0) {
                setImagesToDisplay(product.mainImageUrl);
            } else {
                setImagesToDisplay([]);
            }

            if (sizes.length > 0 && (!selectedSize || !sizes.includes(selectedSize))) {
                setSelectedSize(sizes[0]);
            } else if (sizes.length === 0) {
                setSelectedSize(null);
            }
        }
    }, [selectedColorVariant, product, selectedSize]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <p className="text-lg">Carregando produto...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <p className="text-lg text-red-500">{error}</p>
                <Link to="/products" className="mt-4 text-blue-400 hover:underline">Voltar para Produtos</Link>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <p className="text-lg">Produto não encontrado.</p>
                <Link to="/products" className="mt-4 text-blue-400 hover:underline">Voltar para Produtos</Link>
            </div>
        );
    }

    const uniqueColorsForDisplay = Array.from(new Set(product.variants.map(v => v.color)));
    if (product.color && !uniqueColorsForDisplay.includes(product.color)) {
        uniqueColorsForDisplay.unshift(product.color);
    }

    return (
        <div className="container mx-auto p-4 md:p-8 text-pink">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/2">
                    <ProductImageGallery images={imagesToDisplay} productName={product.name} />
                </div>
                <div className="lg:w-1/2 flex flex-col justify-start sticky top-20 h-fit">
                    <h1 className="text-3xl lg:text-4xl mb-4">{product.name}</h1>
                    <p className="text-sm lg:text-sm mb-3 text-white">R$ {product.price.toFixed(2)}</p>

                    {product.variants && product.variants.length > 0 && (
                        <ProductVariantSelector
                            uniqueColorsForDisplay={uniqueColorsForDisplay}
                            selectedColorVariant={selectedColorVariant}
                            onSelectColor={setSelectedColorVariant}
                            availableSizesForColor={availableSizesForColor}
                            allPossibleSizes={allPossibleSizes} 
                            selectedSize={selectedSize}
                            onSelectSize={setSelectedSize}
                        />
                    )}

                    <div className="flex flex-row items-center gap-4 w-full mt-4">
                        <ProductQuantitySelector
                            quantity={quantity}
                            onQuantityChange={setQuantity}
                        />
                        <AddToCartButton
                            product={product}
                            selectedColorVariant={selectedColorVariant}
                            selectedSize={selectedSize}
                            quantity={quantity}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;