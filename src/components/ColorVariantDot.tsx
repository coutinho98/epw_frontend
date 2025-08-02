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
        sm: 'w-2 h-2',
        md: 'w-4.5 h-4.5',
        lg: 'w-10 h-10'
    };

    return (
        <div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`${sizeClasses[size]} rounded-full cursor-pointer transition-all duration-200
                ${isSelected ? 'ring-3 ring-white ' : ''}`}
            title={color}>
            <div
                className="w-full h-full rounded-full transition-transform duration-200"
                style={{
                    backgroundColor: colorValue,
                    transform: isSelected ? 'scale(0.6)' : 'scale(1)' 
                }}
            />
        </div>
    );
};

export default ColorVariantDot;