import { Document } from 'mongoose';

export interface ITechCardItem {
  productId: string;
  uom?: string;
  quantity: number;
  costRatio?: number;
}

export interface ITechCard {
  code?: string;
  name: string;
  description?: string;
  duration?: number;
  durationType?: string;
  inputs: ITechCardItem[];
  outputs: ITechCardItem[];
  status?: string;
}

export interface ITechCardDocument extends ITechCard, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}
