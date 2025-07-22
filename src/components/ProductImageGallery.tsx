import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
    const isMobile = useIsMobile();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const img = container.querySelector('img') as HTMLImageElement;
        if (!img) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        img.style.transform = 'scale(2)';
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const img = container.querySelector('img') as HTMLImageElement;
        if (!img) return;

        img.style.transform = 'scale(1)';
    };

   return (
        <div className="w-full">
            {isMobile ? (
                <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                        src={images[currentImageIndex]}
                        alt={`${productName} imagem ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain transition-transform duration-300 ease-in-out"
                        loading="lazy"
                    />
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r-lg"
                                aria-label="Previous image"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l-lg"
                                aria-label="Next image"
                            >
                                &gt;
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-gray-400'}`}
                                        aria-label={`View image ${idx + 1}`}
                                    ></button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex flex-col">
                    {images.map((imgUrl, index) => (
                        <div
                            key={`${imgUrl}-${index}`}
                            className="w-full overflow-hidden cursor-zoom-in"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <img
                                src={imgUrl}
                                alt={`${productName} imagem ${index + 1}`}
                                className="w-full h-auto object-contain transition-transform duration-100 ease-out"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImageGallery;