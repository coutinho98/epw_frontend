// src/pages/ProductsPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Product } from '../types/Product';
import { Variant } from '../types/Variant';
import ProductSection from '../components/ProductSection';
import { Category } from '../types/Category';

// Combinamos o tipo de Produto com as suas variações
interface ProductWithVariants extends Product {
    variants: Variant[];
}

const ProductsPage = () => {
    const { categoryId } = useParams<{ categoryId?: string }>();
    const [products, setProducts] = useState<ProductWithVariants[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [categoryName, setCategoryName] = useState('Todos os Produtos');

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
                        const variantsResponse = await api.get<Variant[]>(`/variants/product/${product.id}`);
                        const variants = Array.isArray(variantsResponse) ? variantsResponse : [];
                        return {
                            ...product,
                            variants: variants,
                        };
                    })
                );
                
                setCategoryName(categoryNameFromApi);
                setProducts(productsWithVariants);
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
        return <div className="text-center p-8 text-red-500">{error}</div>;
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