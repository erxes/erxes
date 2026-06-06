export interface ICoupon {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  type: string;
  amount: number;
  createdBy: {
    email: string;
    details: {
      firstName?: string;
      fullName?: string;
      lastName?: string;
      avatar?: string;
      middleName?: string;
      shortName?: string;
    };
  };
  updatedBy: {
    email: string;
    details: {
      avatar?: string;
      firstName?: string;
      fullName?: string;
      lastName?: string;
      shortName?: string;
      middleName?: string;
    };
  };
  conditions: any;
  kind: string;
  value: number;
  buyScore?: number;
  restrictions?: {
    minimumSpend?: number;
    maximumSpend?: number;
    categoryIds?: string[];
    excludeCategoryIds?: string[];
    productIds?: string[];
    excludeProductIds?: string[];
    tag?: string[];
    orExcludeTag?: string[];
  };
  codeRule?: {
    codeLength?: number;
    prefixUppercase?: string;
    pattern?: string;
    redemptionLimitPerUser?: number;
    characterSet?: string;
    numberOfCodes?: number;
    postfixUppercase?: string;
    usageLimit?: number;
    staticCode?: string;
  };
}
