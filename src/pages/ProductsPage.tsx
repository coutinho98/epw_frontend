// src/pages/ProductsPage.tsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Product } from '../types/Product';
import { Variant } from '../types/Variant'; 
import ProductSection from '../components/ProductSection';

interface ProductWithVariants extends Product {
    variants: Variant[];
}

const ProductsPage = () => {
    const [products, setProducts] = useState<ProductWithVariants[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProductsAndVariants = async () => {
            try {
                const productsResponse = await api.get<Product[]>(`/products`);

                const productsWithVariants = await Promise.all(
                    productsResponse.map(async (product) => {
                        const variantsResponse = await api.get<Variant[]>(`/variants/product/${product.id}`);
                        return {
                            ...product,
                            variants: variantsResponse,
                        };
                    })
                );
                setProducts(productsWithVariants);
            } catch (err: any) {
                setError(err.message || 'Falha ao carregar os produtos e suas variações.');
                console.error('Failed to fetch products:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProductsAndVariants();
    }, []);

    return (
        <div className="container mx-auto p-4 w-full max-w-[1416px]">
            <ProductSection title="" products={products} />
        </div>
    );
};

export default ProductsPage;