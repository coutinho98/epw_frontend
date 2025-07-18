import { Variant } from "./Variant";

export interface Product {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    price: number;
    mainImageUrl: string[];
    isFeatured: boolean;
    isAvailable: boolean;
    categoryId: string | null;
    variants: Variant[];
    color: string,
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProductDto {
    name: string;
    description?: string;
    slug: string;
    price: number;
    mainImageUrl: string;
    isFeatured?: boolean;
    isAvailable?: boolean;
    categoryId?: string;
}