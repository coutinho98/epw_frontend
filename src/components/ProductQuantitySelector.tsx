interface ProductQuantitySelectorProps {
    quantity: number;
    onQuantityChange: (quantity: number) => void;
}

const ProductQuantitySelector: React.FC<ProductQuantitySelectorProps> = ({ quantity, onQuantityChange }) => {
    return (
        <div className="flex items-center">
            <select
                id="quantity-select"
                value={quantity}
                onChange={(e) => onQuantityChange(Number(e.target.value))}
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
    );
};

export default ProductQuantitySelector;
