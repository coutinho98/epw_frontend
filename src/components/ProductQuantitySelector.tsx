import { useState, useEffect, useRef } from 'react';

interface ProductQuantitySelectorProps {
    quantity: number;
    onQuantityChange: (quantity: number) => void;
    maxQuantity?: number;
}

const ProductQuantitySelector: React.FC<ProductQuantitySelectorProps> = ({ quantity, onQuantityChange, maxQuantity = 9 }) => {
    const [showCustomInput, setShowCustomInput] = useState(quantity > maxQuantity);
    const [localQuantity, setLocalQuantity] = useState(String(quantity));
    const customInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalQuantity(String(quantity));
        if (quantity > maxQuantity) {
            setShowCustomInput(true);
        }
    }, [quantity, maxQuantity]);

    useEffect(() => {
        if (showCustomInput && customInputRef.current) {
            customInputRef.current.focus();
        }
    }, [showCustomInput]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'custom') {
            setShowCustomInput(true);
            return;
        }
        onQuantityChange(Number(value));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalQuantity(e.target.value);
    };

    const handleBlur = () => {
        const newQuantity = Number(localQuantity);
        if (isNaN(newQuantity) || newQuantity < 1) {
            onQuantityChange(1);
        } else {
            onQuantityChange(newQuantity);
        }

        if (newQuantity <= maxQuantity) {
            setShowCustomInput(false);
        }
    };

    return (
        <div className="flex items-center">
            {showCustomInput ? (
                <input
                    ref={customInputRef}
                    type="number"
                    value={localQuantity}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="w-20 p-2 border bg-black text-white text-lg text-center"
                    style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                    }}
                />
            ) : (
                <select
                    id="quantity-select"
                    value={quantity <= maxQuantity ? quantity : 'custom'}
                    onChange={handleSelectChange}
                    className="w-20 p-2 border bg-black text-white text-lg text-center appearance-none bg-no-repeat bg-right pr-8 cursor-pointer"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.5em 1.5em'
                    }}
                >
                    {[...Array(maxQuantity)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {i + 1}
                        </option>
                    ))}
                    <option value="custom">10+</option>
                </select>
            )}
        </div>
    );
};

export default ProductQuantitySelector;