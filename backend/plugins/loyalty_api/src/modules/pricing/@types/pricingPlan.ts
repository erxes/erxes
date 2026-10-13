import { Document } from 'mongoose';
import { IPriceRule } from './priceRule';
import { IQuantityRule } from './quantityRule';
import { IExpiryRule } from './expiryRule';
import { IRepeatRule } from './repeatRule';

export type PricingPlanPriority = '' | 'public' | 'posBase' | 'pipelineBase';

// Matched by core product condition code, which outlives the condition itself.
// Once the plan applies to a line, this rule alone decides its discount.
export interface IPricingConditionRule {
  conditionCode: string;
  discountType: 'default' | 'subtraction' | 'percentage' | 'bonus';
  discountValue: number;
  discountBonusProduct?: string;
  priceAdjustType:
    | 'none'
    | 'default'
    | 'round'
    | 'floor'
    | 'ceil'
    | 'endsWith9';
  priceAdjustFactor: number;
}

export interface IPricingPlan {
  name: string;
  status: string;
  type: string;
  value: number;
  priceAdjustType: 'none' | 'round' | 'floor' | 'ceil' | 'endsWith9';
  priceAdjustFactor: number;
  bonusProduct?: string;
  priority: PricingPlanPriority;

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

  startDate?: Date;
  endDate?: Date;

  departmentIds?: string[];
  branchIds?: string[];
  boardId?: string;
  pipelineId?: string;
  stageId?: string;

  isPriceEnabled?: boolean;
  priceRules?: IPriceRule[];

  isQuantityEnabled?: boolean;
  quantityRules?: IQuantityRule[];

  isExpiryEnabled?: boolean;
  expiryRules?: IExpiryRule[];

  isRepeatEnabled?: boolean;
  repeatRules?: IRepeatRule[];

  conditionRules?: IPricingConditionRule[];

  createdBy?: string;
  updatedBy?: string;
}

export interface IPricingPlanDocument extends IPricingPlan, Document {
  _id: string;
}
