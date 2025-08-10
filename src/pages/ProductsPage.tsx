// src/pages/ProductsPage.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { Product } from '../types/Product';
import { Variant } from '../types/Variant';
import ProductSection from '../components/ProductSection';
import { Category } from '../types/Category';

interface ProductWithVariants extends Product {
    variants: Variant[];
}

const ProductsPage = () => {
    const { categoryId } = useParams<{ categoryId?: string }>();
    const [products, setProducts] = useState<ProductWithVariants[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [categoryName, setCategoryName] = useState('Todos os Produtos');

    const getFirstValidImage = (variants: Variant[]): string | null => {
        for (const variant of variants) {
            if (variant.imageUrls && Array.isArray(variant.imageUrls) && variant.imageUrls.length > 0) {
                const firstImage = variant.imageUrls.find(url => url && url.trim() !== '');
                if (firstImage) {
                    return firstImage;
                }
            }
        }
        return null;
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError('');
            try {
                let productsResponse: Product[] = [];
                let categoryNameFromApi = 'Todos os Produtos';

                if (categoryId) {
                    const categoryResponse = await api.get<Category>(`/categories/${categoryId}`);
                    categoryNameFromApi = categoryResponse.name;
                    productsResponse = await api.get<Product[]>(`/products/category/${categoryId}`);
                } else {
                    productsResponse = await api.get<Product[]>(`/products`);
                }

                const productsWithVariants = await Promise.all(
                    productsResponse.map(async (product) => {
                        try {
                            const variantsResponse = await api.get<Variant[]>(`/variants/product/${product.id}`);
                            const variants = Array.isArray(variantsResponse) ? variantsResponse : [];

                            console.log(`Produto ${product.id} tem ${variants.length} variantes:`, variants);

                            const sortedVariants = variants.sort((a, b) => {
                                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

                            });

                            const productWithVariants: ProductWithVariants = {
                                ...product,
                                variants: sortedVariants,
                            };

                            if (!product.mainImageUrl || product.mainImageUrl.length === 0) {
                                const firstValidImage = getFirstValidImage(sortedVariants);
                                if (firstValidImage) {
                                    productWithVariants.mainImageUrl = [firstValidImage];
                                }
                            }

                            return productWithVariants;
                        } catch (variantError) {
                            console.error(`Erro ao buscar variantes do produto ${product.id}:`, variantError);
                            return {
                                ...product,
                                variants: [],
                            };
                        }
                    })
                );

                setCategoryName(categoryNameFromApi);
                setProducts(productsWithVariants);

                // Debug: log dos produtos finais
                console.log('Produtos com variantes:', productsWithVariants);

            } catch (err: any) {
                console.error("Erro ao carregar produtos:", err);
                setError(err.message || 'Falha ao carregar os produtos.');
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId]);

    if (isLoading) {
        return <div className="text-center p-8">Carregando...</div>;
    }

    if (error) {
        return (<div className="text-center p-8 text-white">
            <p className="text-3xl md:text-3xl font-bold  mb-4">Estamos atualizando nossa coleção! Em breve teremos novos produtos nesta categoria.</p>
            <Link to="/" className="inline-block text-blue-400 hover:underline">Ver todos os produtos</Link>
        </div>)
    }

    if (products.length === 0) {
        return <div className="text-center p-8 text-gray-500">Nenhum produto encontrado.</div>;
    }

    return (
        <div className="container mx-auto p-4 w-full max-w-[1416px]">
            <h1 className="text-3xl md:text-4xl font-bold tracking-wider ">{categoryName}</h1>
            <ProductSection title="" products={products} />
        </div>
    );
};

export default ProductsPage;