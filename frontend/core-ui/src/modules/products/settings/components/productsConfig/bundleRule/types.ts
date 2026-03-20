export interface IBundleRuleProduct {
  _id: string;
  name: string;
  __typename?: string;
}

export interface IBundleRuleItem {
  quantity?: number;
  productIds?: string[];
  products?: IBundleRuleProduct[];
  priceValue?: number;
  priceType?: string;
  priceAdjustType?: string;
  priceAdjustFactor?: string;
  percent?: number;
  code?: string;
  allowSkip?: boolean;
  __typename?: string;
}

export interface IBundleRule {
  _id: string;
  name: string;
  description?: string;
  code?: string;
  createdAt?: string;
  userId?: string;
  rules?: IBundleRuleItem[];
  __typename?: string;
}
