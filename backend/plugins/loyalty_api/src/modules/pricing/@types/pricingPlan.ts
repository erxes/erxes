import { Document } from 'mongoose';
import { IPriceRule} from './priceRule';
import { IQuantityRule } from './quantityRule';
import { IExpiryRule } from './expiryRule';
import { IRepeatRule } from './repeatRule';

export interface IPricingPlan {
  name: string;
  status: string;
  type: string;
  value: number;
  priceAdjustType: 'none' | 'round' | 'floor' | 'ceil' | 'endsWith9';
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

  // Customer & agent targeting (dynamic conditions).
  // Empty arrays = no constraint, so existing plans are unaffected.
  customerIds?: string[];
  customerIdsExcluded?: string[];
  customerSegmentIds?: string[];

  agentIds?: string[];
  agentIdsExcluded?: string[];
  agentSegmentIds?: string[];

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

  createdBy?: string;
  updatedBy?: string;
}

export interface IPricingPlanDocument extends IPricingPlan, Document {
  _id: string;
}