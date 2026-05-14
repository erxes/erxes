export interface IProductRuleCategory {
  _id?: string;
  name: string;
  __typename?: string;
}

export interface IProductRuleProduct {
  _id?: string;
  name: string;
  __typename?: string;
}

export interface IProductRuleTag {
  _id?: string;
  name: string;
  __typename?: string;
}

export interface IProductRule {
  _id: string;
  name: string;
  unitPrice: number;
  bundleId?: string;
  categoryIds?: string[];
  excludeCategoryIds?: string[];
  productIds?: string[];
  excludeProductIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];
  categories?: IProductRuleCategory[];
  excludeCategories?: IProductRuleCategory[];
  products?: IProductRuleProduct[];
  excludeProducts?: IProductRuleProduct[];
  tags?: IProductRuleTag[];
  excludeTags?: IProductRuleTag[];
  createdAt?: string;
  userId?: string;
  __typename?: string;
}
