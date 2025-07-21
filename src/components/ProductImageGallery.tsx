interface ProductImageGalleryProps {
    images: string[];
    productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
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
        <div className="flex flex-col">
            {images.length > 0 ? (
                images.map((imgUrl, index) => (
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
                ))
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-700">
                    Nenhuma imagem disponível
                </div>
            )}
        </div>
    );
};

export default ProductImageGallery;