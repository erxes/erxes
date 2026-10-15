export interface ProductGroup {
  _id: string;
  categoryIds?: string[];
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
