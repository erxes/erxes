import { Document } from 'mongoose';

// A state a product can be sold in, e.g. "Dented"; pricing decides what it is worth.
export interface IProductCondition {
  _id?: string;
  name: string;
}

export interface IProductConditionGroup {
  name: string;
  description?: string;
  conditions: IProductCondition[];
}

export interface IProductConditionGroupDocument
  extends IProductConditionGroup,
    Document {
  _id: string;
  conditions: (IProductCondition & { _id: string })[];
  createdAt: Date;
  updatedAt: Date;
}
