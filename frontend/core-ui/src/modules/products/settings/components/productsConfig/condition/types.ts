export interface IProductCondition {
  _id: string;
  code: string;
  name: string;
  description?: string | null;
  productCount?: number | null;
}

export type ProductConditionCodesMode = 'add' | 'remove';
