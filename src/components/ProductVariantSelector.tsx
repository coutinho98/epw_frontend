// src/components/ProductVariantSelector.tsx
import React from 'react';
import ColorVariantDot from './ColorVariantDot';
import { Button } from './ui/button';

interface ProductVariantSelectorProps {
    uniqueColorsForDisplay: string[];
    selectedColorVariant: string | null;
    onSelectColor: (color: string) => void;
    availableSizesForColor: string[];
    allPossibleSizes: string[];
    selectedSize: string | null;
    onSelectSize: (size: string) => void;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
    uniqueColorsForDisplay,
    selectedColorVariant,
    onSelectColor,
    availableSizesForColor,
    allPossibleSizes, 
    selectedSize,
    onSelectSize,
}) => {
    return (
        <>
            {uniqueColorsForDisplay.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm mb-3">Selecione a cor: <span className="font-bold">{selectedColorVariant}</span></h3>
                    <div className="flex flex-wrap gap-6">
                        {uniqueColorsForDisplay.map(color => (
                            <ColorVariantDot
                                key={color}
                                color={color}
                                isSelected={selectedColorVariant === color}
                                onClick={() => onSelectColor(color)}
                            />
                        ))}
                    </div>
                </div>
            )}
            <div className="mb-8">
                <h3 className="text-sm mb-2">Selecione o tamanho <span className='ml-1 underline underline-offset-4 cursor-pointer hover:text-gray-300'>Guia de Tamanho</span></h3>
                <div className="flex flex-wrap gap-3">
                    {allPossibleSizes.map(size => { 
                        const isAvailable = availableSizesForColor.includes(size); 
                        return (
                            <Button
                                key={size}
                                variant={selectedSize === size && isAvailable ? 'default' : 'outline'} 
                                onClick={() => isAvailable && onSelectSize(size)} 
                                disabled={!isAvailable} 
                                className={`min-w-[60px] h-12 text-base ${selectedSize === size && isAvailable
                                    ? 'text-white border border-2'
                                    : 'bg-transparent border-neutral-900'
                                    } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''} // Estilo para desabilitado
                                }`}
                            >
                                {size}
                            </Button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default ProductVariantSelector;