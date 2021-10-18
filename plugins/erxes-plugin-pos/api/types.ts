export interface IPOSIntegration {
    kind: string;
    name?: string;
    description?: string;
    brandId?: string;
    tagIds?: string[];
    isActive?: boolean;
    productDetails: string[];
    productGroupIds: string[];
}