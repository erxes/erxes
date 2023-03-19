export type Rule = {
  type?: string;
  value?: string;
  discountType?: string;
  discountValue?: string;
  discountBonusProduct?: string;
  priceAdjustType?:
    | 'none'
    | 'default'
    | 'round'
    | 'floor'
    | 'ceil'
    | 'endsWith9';
  priceAdjustFactor?: number;
};

export type RepeatValue = {
  label: string;
  value: string;
};

export type RepeatRule = {
  type: string;
  dayStartValue?: Date;
  dayEndValue?: Date;
  weekValue?: RepeatValue[];
  monthValue?: RepeatValue[];
  yearStartValue?: Date;
  yearEndValue?: Date;
};

export type PricingPlan = {
  name: string;
  status: 'active' | 'archive' | 'draft' | 'completed';
  type: 'fixed' | 'subtraction' | 'percentage' | 'bonus';
  value: number;
  priceAdjustType: 'none' | 'round' | 'floor' | 'ceil' | 'endsWith9';
  priceAdjustFactor: number;
  bonusProduct?: string;
  isPriority: boolean;

  applyType: 'category' | 'product' | 'segment' | 'bundle';

  products: string[];
  productsExcluded: string[];
  productsBundle: string[];
  categories: string[];
  categoriesExcluded: string[];
  segments: string[];

  isStartDateEnabled: boolean;
  isEndDateEnabled: boolean;

  startDate: Date | null;
  endDate: Date | null;

  departmentIds: string[];
  branchIds: string[];
  boardId: string;
  pipelineId: string;
  stageId: string;

  isQuantityEnabled: boolean;
  quantityRules: Rule[];

  isPriceEnabled: boolean;
  priceRules: Rule[];

  isExpiryEnabled: boolean;
  expiryRules: Rule[];

  isRepeatEnabled: boolean;
  repeatRules: RepeatRule[];
};
