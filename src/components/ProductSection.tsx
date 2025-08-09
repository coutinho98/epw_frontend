import { Product } from '../types/Product';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom'; 

interface ProductSectionProps {
    title: string;
    products: Product[];
}

const ProductSection = ({ title, products }: ProductSectionProps) => {
    return (
        <section className="py-8 relative">
            <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
                <div className="flex items-center mb-8">
                    <h2 className="text-2xl font-bold">{title}</h2>
                </div>
                <Link to="/products" className="absolute top-0 right-4 lg:right-18 z-10 hidden md:block"> 
                    
                </Link>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 justify-items-center">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductSection;