import { IAttachment } from 'erxes-ui';
import { ApolloError } from '@apollo/client';

export type PricingPriority = '' | 'public' | 'posBase' | 'pipelineBase';
export type PricingAppliesTo =
  | 'category'
  | 'product'
  | 'segment'
  | 'vendor'
  | 'tag'
  | 'bundle';

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

export type PricingScheduleWindowType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly';

// Which moment of a purchase the schedule is checked at.
export type PricingScheduleMoment = 'checkout' | 'orderCreated' | 'either';

// Read on the organization's wall clock. An end earlier than the start runs
// past midnight; '24:00' ends the day.
export interface IPricingActiveWindow {
  type: PricingScheduleWindowType;
  startTime: string;
  endTime: string;
  weekDays?: number[] | null;
  monthDays?: number[] | null;
  // 'MM-DD'; a later start than end wraps the new year.
  fromMonthDay?: string | null;
  toMonthDay?: string | null;
}

// A line sold under the core product condition with this code is priced by
// this rule instead of the plan's own rules.
export interface IPricingConditionRule {
  conditionCode: string;
  discountType: 'default' | 'subtraction' | 'percentage' | 'bonus';
  discountValue: number;
  discountBonusProduct?: string | null;
  priceAdjustType: string;
  priceAdjustFactor: number;
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
  activeWindows?: IPricingActiveWindow[];
  closedDates?: string[];
  scheduleMoment?: PricingScheduleMoment;

  conditionRules?: IPricingConditionRule[];

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
