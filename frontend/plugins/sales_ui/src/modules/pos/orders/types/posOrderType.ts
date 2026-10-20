export interface TPosOrderForm {
  cashAmount: number;
  mobileAmount: number;
  spendPoints: number;
  name?: string;
  description?: string;
  [key: string]: number | string | undefined;
}

export type TPosOrderFormData = {
  [key: string]: number | string | undefined;
};

export type TPosOrderItem = import('@/pos/utils/posOrderJson').PosOrderItem;
