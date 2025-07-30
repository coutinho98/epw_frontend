import { Variant } from "./Variant";

export interface Product {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    size: string;
    price: number;
    mainImageUrl: string[];
    isFeatured: boolean;
    isAvailable: boolean;
    categoryId: string | null;
    variants: Variant[];
    color: string,
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductDto {
    name: string;
    description?: string;
    slug: string;
    price: number;
    isFeatured?: boolean;
    isAvailable?: boolean;
    categoryId?: string;
}