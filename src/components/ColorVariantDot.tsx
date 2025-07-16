import { getColorValue } from '../lib/colorUtils';

interface ColorVariantDotProps {
    color: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    isSelected?: boolean;
}

const ColorVariantDot = ({
    color,
    onMouseEnter,
    onMouseLeave,
    onClick,
    size = 'md',
    isSelected = false,
}: ColorVariantDotProps) => {
    const colorValue = getColorValue(color);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`${sizeClasses[size]} rounded-full cursor-pointer transition-all duration-200
                ${isSelected ? 'ring-2 ring-white' : ''}`}
            style={{ backgroundColor: colorValue }}
            title={color}
        />
    );
};

export default ColorVariantDot;