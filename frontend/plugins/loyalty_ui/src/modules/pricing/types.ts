import { IAttachment } from 'erxes-ui';
import { ApolloError } from '@apollo/client';

export type PricingPriority = '' | 'public' | 'posBase';

export interface IPricing {
  _id: string;
  name: string;
  status: 'active' | 'archived' | 'draft' | 'completed';
  priority: PricingPriority;
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
  priority: PricingPriority;
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

  customerIds?: string[];
  customerTags?: string[];
  customerExcludeTags?: string[];
  customerSegmentIds?: string[];

  companyIds?: string[];
  companyTags?: string[];
  companyExcludeTags?: string[];
  companySegmentIds?: string[];

  userIds?: string[];
  userPositions?: string[];
  userSegmentIds?: string[];

  brokerCustomerIds?: string[];
  brokerCustomerTags?: string[];
  brokerCustomerExcludeTags?: string[];
  brokerCustomerSegmentIds?: string[];

  brokerCompanyIds?: string[];
  brokerCompanyTags?: string[];
  brokerCompanyExcludeTags?: string[];
  brokerCompanySegmentIds?: string[];

  brokerUserIds?: string[];
  brokerUserPositions?: string[];
  brokerUserSegmentIds?: string[];

  isStartDateEnabled?: boolean;
  isEndDateEnabled?: boolean;
  startDate?: string;
  endDate?: string;

  branchIds?: string[];
  departmentIds?: string[];
  boardId?: string | null;
  pipelineId?: string | null;
  stageId?: string | null;

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

export interface IProductCategory {
  _id: string;
  name: string;
  avatar?: IAttachment;
  code: string;
  order: string;
  productCount: number;
  parentId?: string;
}

export interface IPricingFixedValue {
  _id: string;
  pricingPlanId: string;
  productId: string;
  sortField?: string;
  uom: string;
  unitPrice: number;
  newPrice: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface ProductCategoriesResponse {
  productCategories: IProductCategory[];
}

export interface UseProductCategoriesResult {
  productCategories: IProductCategory[] | undefined;
  loading: boolean;
  error: ApolloError | undefined;
}
