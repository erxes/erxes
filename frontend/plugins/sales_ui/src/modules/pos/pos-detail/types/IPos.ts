export interface ProductGroup {
  _id: string;
  categoryIds?: string[];
  productIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];
  excludedCategoryIds?: string[];
  excludedProductIds?: string[];
}

export interface CatProd {
  _id: string;
  categoryId: string;
  code?: string;
  name?: string;
  productId: string;
}
