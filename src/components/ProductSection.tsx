import { Product } from '../types/Product';
import ProductCard from './ProductCard';

interface ProductSectionProps {
    title: string;
    products: Product[];
}

const ProductSection = ({ title, products }: ProductSectionProps) => {
    return (
        <section className="py-8">
            <h2 className="text-2xl font-bold mb-8 text-center">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-22 justify-items-center">
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-400">Nenhum produto encontrado.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductSection;