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

export type DiscountData = {
  name: string;
  status: 'active' | 'archive' | 'draft' | 'completed';
  value: number;
  type: 'fixed' | 'subtraction' | 'percentage' | 'bonus';
  bonusProduct?: string;

  applyType: 'category' | 'product';

  products: string[];
  productsExcluded: string[];
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
