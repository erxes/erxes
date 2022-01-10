import { Document } from 'mongoose';

import { IItemCommonFields } from './boards';

export interface IProductData extends Document {
  productId: string;
  uom: string;
  currency: string;
  quantity: number;
  unitPrice: number;
  taxPercent?: number;
  tax?: number;
  discountPercent?: number;
  discount?: number;
  amount?: number;
  tickUsed?: boolean;
  assignUserId?: string;
}

interface IPaymentsData {
  [key: string]: {
    currency?: string;
    amount?: number;
  };
}

export interface IDeal extends IItemCommonFields {
  productsData?: IProductData[];
  paymentsData?: IPaymentsData[];
}

export interface IDealDocument extends IDeal, Document {
  _id: string;
}
