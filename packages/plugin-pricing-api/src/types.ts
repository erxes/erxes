export type Plan = {
  name: string;
  status: string;
  type: string;
  value: number;
  priceAdjustType: 'none' | 'round' | 'floor' | 'ceil' | 'endsWith9';
  priceAdjustFactor: number;
  bonusProduct?: string;
  isPriority: boolean;

  applyType: string;

  products: string[];
  productsExcluded: string[];
  productsBundle: string[];
  categories: string[];
  categoriesExcluded: string[];

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
  priceRules?: CommonRule[];

  isQuantityEnabled?: boolean;
  quantityRules?: CommonRule[];

  isExpiryEnabled?: boolean;
  expiryRules?: CommonRule[];

  isRepeatEnabled?: boolean;
  repeatRules?: RepeatRule[];

  createdBy?: string;
  updatedBy?: string;
};

export type CommonRule = {
  type: string;
  value: number;
  discountType: string;
  discountValue: number;
  discountBonusProduct: string;
  priceAdjustType:
    | 'none'
    | 'default'
    | 'round'
    | 'floor'
    | 'ceil'
    | 'endsWith9';
  priceAdjustFactor: number;
};

export type RepeatValue = {
  label: string;
  value: string;
};

export type RepeatRule = {
  type: string;
  dayStartValue: Date;
  dayEndValue: Date;
  weekValue: RepeatValue[];
  monthValue: RepeatValue[];
  yearStartValue: Date;
  yearEndValue: Date;
};

export type CalculatedRule = {
  passed: boolean;
  type: string;
  value: number;
  bonusProducts: string[];
};

export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
  manufacturedDate: string;
};
