export type Rule = {
  type?: string;
  value?: string;
  discountType?: string;
  discountValue?: string;
  discountBonusProduct?: string;
};

export type RepeatValue = {
  label: string;
  value: string;
};

export type PricingPlan = {
  name: string;
  status: 'active' | 'archive' | 'draft' | 'completed';
  type: 'fixed' | 'subtraction' | 'percentage' | 'bonus';
  value: number;
  bonusProduct?: string;
  isPriority: boolean;

  applyType: 'category' | 'product' | 'bundle';

  products: string[];
  productsExcluded: string[];
  productsBundle: string[];
  categories: string[];
  categoriesExcluded: string[];

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
  repeatRules: [
    {
      type?: string;
    }
  ];
};
