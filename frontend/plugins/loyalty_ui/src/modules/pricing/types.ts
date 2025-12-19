export interface IPricing {
  _id: string;
  name: string;
  status: 'active' | 'archived' | 'draft' | 'completed';
  isPriority: boolean;
  applyType: 'category' | 'product' | 'order';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPricingRepeatValue {
  label: string;
  value: string;
}

export interface IPricingQuantityRule {
  type: string;
  value: number;
  discountType: string;
  discountValue: number;
  discountBonusProduct: string;
  priceAdjustType: string;
  priceAdjustFactor: number;
}

export interface IPricingPriceRule {
  type: string;
  value: number;
  discountType: string;
  discountValue: number;
  discountBonusProduct: string;
  priceAdjustType: string;
  priceAdjustFactor: number;
}

export interface IPricingExpiryRule {
  type: string;
  value: number;
  discountType: string;
  discountValue: number;
  discountBonusProduct: string;
  priceAdjustType: string;
  priceAdjustFactor: number;
}

export interface IPricingRepeatRule {
  type: string;
  dayStartValue?: string;
  dayEndValue?: string;
  weekValue?: IPricingRepeatValue[];
  monthValue?: IPricingRepeatValue[];
  yearStartValue?: string;
  yearEndValue?: string;
}

export interface IPricingPlanDetail {
  _id: string;
  name: string;
  status: string;
  type: string;
  value: number;
  priceAdjustType: string;
  priceAdjustFactor: number;
  bonusProduct?: string;
  isPriority: boolean;
  applyType: string;

  products?: string[];
  productsExcluded?: string[];
  productsBundle?: string[][];
  categories?: string[];
  categoriesExcluded?: string[];
  segments?: string[];
  vendors?: string[];
  tags?: string[];
  tagsExcluded?: string[];

  isStartDateEnabled?: boolean;
  isEndDateEnabled?: boolean;
  startDate?: string;
  endDate?: string;

  branchIds?: string[];
  departmentIds?: string[];
  boardId?: string;
  pipelineId?: string;
  stageId?: string;

  isQuantityEnabled?: boolean;
  quantityRules?: IPricingQuantityRule[];

  isPriceEnabled?: boolean;
  priceRules?: IPricingPriceRule[];

  isExpiryEnabled?: boolean;
  expiryRules?: IPricingExpiryRule[];

  isRepeatEnabled?: boolean;
  repeatRules?: IPricingRepeatRule[];

  createdAt?: string;
  createdBy?: string;
  createdUser?: { _id: string } | null;
  updatedAt?: string;
  updatedBy?: string;
  updatedUser?: { _id: string } | null;

  productIds?: string[];
}
