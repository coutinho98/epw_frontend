import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types/Product';
import { Variant } from '../types/Variant';
import ColorVariantDot from '../components/ColorVariantDot';
import { Button } from '../components/ui/button';
import api from '../services/api';

const ProductDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [product, setProduct] = useState<(Product & { variants: Variant[] }) | null>(null);
    const [_mainImage, setMainImage] = useState<string>('');
    const [_allVariantImages, setAllVariantImages] = useState<string[]>([]);
    const [selectedColorVariant, setSelectedColorVariant] = useState<string | null>(null);
    const [availableSizesForColor, setAvailableSizesForColor] = useState<string[]>([]);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [_loading, setLoading] = useState<boolean>(true);
    const [_error, setError] = useState<string | null>(null);

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
                        const sizesForFirstColor = fetchedProduct.variants
                            .filter(v => v.color === firstUniqueColorVariant.color)
                            .map(v => v.size)
                            .sort();
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
                            setAllVariantImages(uniqueInitialImages);
                            setMainImage(uniqueInitialImages[0]);
                        } else if (fetchedProduct.mainImageUrl && fetchedProduct.mainImageUrl.length > 0) {
                            setAllVariantImages(fetchedProduct.mainImageUrl);
                            setMainImage(fetchedProduct.mainImageUrl[0]);
                        } else {
                            setAllVariantImages([]);
                            setMainImage('');
                        }

                        if (sizesForFirstColor.length > 0) {
                            setSelectedSize(sizesForFirstColor[0]);
                        }
                    } else {
                        setMainImage((fetchedProduct.mainImageUrl && fetchedProduct.mainImageUrl[0]) || '');
                        setAllVariantImages(fetchedProduct.mainImageUrl || []);
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
                setAllVariantImages(uniqueImages);
                setMainImage(uniqueImages[0]);
            } else if (product.mainImageUrl && product.mainImageUrl.length > 0) {
                setAllVariantImages(product.mainImageUrl);
                setMainImage(product.mainImageUrl[0]);
            } else {
                setAllVariantImages([]);
                setMainImage('');
            }

            if (sizes.length > 0 && (!selectedSize || !sizes.includes(selectedSize))) {
                setSelectedSize(sizes[0]);
            } else if (sizes.length === 0) {
                setSelectedSize(null);
            }
        }
    }, [selectedColorVariant, product]);

    const getAllAvailableImages = (): string[] => {
        if (!product) return [];

        let images: string[] = [];

        if (selectedColorVariant) {
            const variantsOfSelectedColor = product.variants.filter(v => v.color === selectedColorVariant);
            variantsOfSelectedColor.forEach(v => {
                if (v.imageUrls && v.imageUrls.length > 0) {
                    images.push(...v.imageUrls);
                }
            });
        }

        if (images.length === 0 && product.mainImageUrl && product.mainImageUrl.length > 0) {
            images = [...product.mainImageUrl];
        }

        return Array.from(new Set(images));
    };

    const imagesToDisplay = getAllAvailableImages();

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

    const handleColorVariantClick = (color: string) => {
        setSelectedColorVariant(color);
    };

    const handleSizeClick = (size: string) => {
        setSelectedSize(size);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const img = container.querySelector('img') as HTMLImageElement;
        if (!img) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        img.style.transform = 'scale(2)';
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const img = container.querySelector('img') as HTMLImageElement;
        if (!img) return;

        img.style.transform = 'scale(1)';
    };

    const handleAddToCart = () => {
        const finalSelectedVariant = product.variants.find(
            v => v.color === selectedColorVariant && v.size === selectedSize
        );

        if (!finalSelectedVariant) {
            alert('Por favor, selecione uma cor e um tamanho válidos.');
            return;
        }
        alert(`Adicionado ao carrinho:\n\nProduto: ${product.name}\nCor: ${finalSelectedVariant.color}\nTamanho: ${finalSelectedVariant.size}\nPreço: R$${product.price.toFixed(2)}`);

        console.log(`Adicionado ao carrinho: ${product.name}, ID da Variante: ${finalSelectedVariant.id}, Cor: ${finalSelectedVariant.color}, Tamanho: ${finalSelectedVariant.size}`);
    };

    const handleQuantityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setQuantity(Number(event.target.value));
    };

    return (
        <div className="container mx-auto p-4 md:p-8 text-white">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/2">
                    {imagesToDisplay.length > 0 && (
                        <div className="flex flex-col">
                            {imagesToDisplay.map((imgUrl, index) => (
                                <div
                                    key={`${imgUrl}-${index}`}
                                    className="w-full overflow-hidden cursor-zoom-in"
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <img
                                        src={imgUrl}
                                        alt={`${product.name} imagem ${index + 1}`}
                                        className="w-full h-auto object-contain transition-transform duration-100 ease-out"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="lg:w-1/2 flex flex-col justify-start">
                    <h1 className="text-3xl lg:text-4xl mb-4">{product.name}</h1>
                    <p className="text-sm lg:text-sm mb-3 text-white">R$ {product.price.toFixed(2)}</p>
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm mb-3">Selecione a cor: <span className="font-bold">{selectedColorVariant}</span></h3>
                            <div className="flex flex-wrap gap-6">
                                {uniqueColorsForDisplay.map(color => (
                                    <ColorVariantDot
                                        key={color}
                                        color={color}
                                        isSelected={selectedColorVariant === color}
                                        onClick={() => handleColorVariantClick(color)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {availableSizesForColor.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm mb-2">Selecione o tamanho <span className='ml-1 underline underline-offset-4 cursor-pointer hover:text-gray-300'>Guia de Tamanho</span></h3>
                            <div className="flex flex-wrap gap-3">
                                {availableSizesForColor.map(size => (
                                    <Button
                                        key={size}
                                        variant={selectedSize === size ? 'default' : 'outline'}
                                        onClick={() => handleSizeClick(size)}
                                        className={`min-w-[60px] h-12 text-base ${selectedSize === size
                                            ? 'text-white border border-2'
                                            : 'bg-transparent border-neutral-900'
                                            }`}
                                    >
                                        {size}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex flex-row items-center gap-4 w-full mt-4">
                        <div className="flex items-center">
                            <select
                                id="quantity-select"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="w-20 p-2 border bg-black text-white text-lg text-center appearance-none bg-no-repeat bg-right pr-8 cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 0.5rem center',
                                    backgroundSize: '1.5em 1.5em'
                                }}
                            >
                                {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button
                            onClick={handleAddToCart}
                            className="flex-grow bg-white text-black py-6 text-sm cursor-pointer hover:bg-gray-300"
                        >
                            Adicionar ao Carrinho
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;