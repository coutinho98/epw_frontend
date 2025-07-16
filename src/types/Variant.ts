export interface Variant {
    id: string;
    productId: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
    additionalPrice: number;
    imageUrls: string[];
    createdAt: Date;
    updatedAt: Date;
}