import { Document } from 'mongoose';

// A state a product can be sold in, e.g. "Dented"; pricing decides what it is worth.
// Products and plans hold the code, so a removed condition comes back by its code.
export interface IProductCondition {
  code: string;
  name: string;
  description?: string;
}

export interface IProductConditionDocument extends IProductCondition, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductConditionCodesMode = 'add' | 'remove';
