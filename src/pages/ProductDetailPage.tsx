import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types/Product';
import { Variant } from '../types/Variant';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
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
    const [selectedVariantStock, setSelectedVariantStock] = useState<number | null>(null);

    const [imagesToDisplay, setImagesToDisplay] = useState<string[]>([]);

    const allPossibleSizes = ['PP', 'P', 'M', 'G'];

    const getAvailableSizesForColor = (product: Product & { variants: Variant[] }, selectedColor?: string): string[] => {
        const sizes: string[] = [];

        if (!selectedColor && product.size && product.size.trim() !== '') {
            sizes.push(product.size);
        }

        if (selectedColor && product.color === selectedColor && product.size && product.size.trim() !== '') {
            sizes.push(product.size);
        }

        if (product.variants && product.variants.length > 0 && selectedColor) {
            const variantSizes = product.variants
                .filter(v => v.color === selectedColor)
                .map(v => v.size)
                .filter(size => size && size.trim() !== '');

            sizes.push(...variantSizes);
        }

        return [...new Set(sizes)].sort();
    };

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
                if (fetchedProduct) {
                    setProduct(fetchedProduct);

                    const uniqueColors = new Map<string, Variant>();
                    if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
                        fetchedProduct.variants.forEach(variant => {
                            if (!uniqueColors.has(variant.color)) {
                                uniqueColors.set(variant.color, variant);
                            }
                        });
                    }

                    if (fetchedProduct.color) {
                        if (!uniqueColors.has(fetchedProduct.color)) {
                            uniqueColors.set(fetchedProduct.color, {
                                id: fetchedProduct.id,
                                color: fetchedProduct.color,
                                imageUrls: fetchedProduct.mainImageUrl,
                                size: fetchedProduct.size || '',
                                productId: fetchedProduct.id,
                                sku: '',
                                stock: 0,
                                additionalPrice: 0,
                                createdAt: '',
                                updatedAt: ''
                            });
                        }
                    }

                    const firstUniqueColorVariant = uniqueColors.values().next().value;
                    if (firstUniqueColorVariant) {
                        setSelectedColorVariant(firstUniqueColorVariant.color);

                        const sizesForColor = getAvailableSizesForColor(fetchedProduct, firstUniqueColorVariant.color);
                        setAvailableSizesForColor(sizesForColor);

                        if (sizesForColor.length > 0) {
                            setSelectedSize(sizesForColor[0]);
                        } else {
                            setSelectedSize(null);
                        }

                        const imagesForInitialColor: string[] = [];

                        if (fetchedProduct.variants) {
                            fetchedProduct.variants
                                .filter(v => v.color === firstUniqueColorVariant.color)
                                .forEach(v => {
                                    if (v.imageUrls && v.imageUrls.length > 0) {
                                        imagesForInitialColor.push(...v.imageUrls);
                                    }
                                });
                        }

                        const uniqueInitialImages = Array.from(new Set(imagesForInitialColor));

                        if (uniqueInitialImages.length > 0) {
                            setImagesToDisplay(uniqueInitialImages);
                        } else if (fetchedProduct.mainImageUrl && fetchedProduct.mainImageUrl.length > 0) {
                            setImagesToDisplay(fetchedProduct.mainImageUrl);
                        } else {
                            setImagesToDisplay([]);
                        }
                    } else {
                        setSelectedColorVariant(fetchedProduct.color || null);
                        setImagesToDisplay((fetchedProduct.mainImageUrl && fetchedProduct.mainImageUrl) || []);

                        if (fetchedProduct.size && fetchedProduct.size.trim() !== '') {
                            setAvailableSizesForColor([fetchedProduct.size]);
                            setSelectedSize(fetchedProduct.size);
                        } else {
                            setAvailableSizesForColor([]);
                            setSelectedSize(null);
                        }
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
            const sizes = getAvailableSizesForColor(product, selectedColorVariant);
            setAvailableSizesForColor(sizes);

            const imagesForSelectedColor: string[] = [];

            if (product.color === selectedColorVariant) {
                if (product.mainImageUrl && product.mainImageUrl.length > 0) {
                    imagesForSelectedColor.push(...product.mainImageUrl);
                }
            }

            const variantsOfSelectedColor = product.variants.filter(v => v.color === selectedColorVariant);
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
        } else if (product && !selectedColorVariant) {
            if (product.size && product.size.trim() !== '') {
                setAvailableSizesForColor([product.size]);
                if (!selectedSize || selectedSize !== product.size) {
                    setSelectedSize(product.size);
                }
            } else {
                setAvailableSizesForColor([]);
                setSelectedSize(null);
            }
        }
    }, [selectedColorVariant, product, selectedSize]);

    useEffect(() => {
        if (product && selectedColorVariant && selectedSize) {
            const currentVariant = product.variants.find(
                v => v.color === selectedColorVariant && v.size === selectedSize
            );
            setSelectedVariantStock(currentVariant?.stock ?? 0);
        } else {
            setSelectedVariantStock(null);
        }
    }, [selectedColorVariant, selectedSize, product]);

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
                    <h1 className="text-3xl lg:text-4xl tracking-widest mb-4">{product.name}</h1>
                    <h3 className="text-base lg:text-base mb-3 tracking-widest text-white">R$ {product.price.toFixed(2)}</h3>
                   {/*  {selectedVariantStock !== null && (
                        <h2 className="mb-4 text-1xl tracking-widest text-white">
                            Estoque: {selectedVariantStock}
                        </h2>
                    )} */}
                    {availableSizesForColor.length > 0 && (
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
                    {product.details && (
                        <div className="mt-8 text-white">
                            <Accordion type="single" collapsible>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className='font-mono text-lg'>Mais Detalhes</AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="list-disc list-inside text-base">
                                            {Array.isArray(product.details)
                                                ? product.details.map((detail, index) => (
                                                    <li key={index}>{detail}</li>
                                                ))
                                                : typeof product.details === 'string'
                                                    ? product.details.split('\n').map((detail, index) => (
                                                        <li key={index}>{detail}</li>
                                                    ))
                                                    : null}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;