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
  // Empty fields = no constraint, so existing plans are unaffected.
  //
  // Customer dimension is typed: customerType picks which entity kind is the
  // buyer. Unset is treated as 'customer'. Only the active kind's fields are
  // evaluated (and persisted by the UI).
  customerType?: 'customer' | 'company';

  customerIds?: string[];
  customerTags?: string[];
  customerExcludeTags?: string[];
  customerSegmentIds?: string[];

  companyIds?: string[];
  companyTags?: string[];
  companyExcludeTags?: string[];
  companySegmentIds?: string[];

  // Agent (salesperson) is always a team-member/user.
  agentUserIds?: string[];
  agentUserPositions?: string[];
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