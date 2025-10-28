import { Document } from 'mongoose';

export interface IProductGroup {
  mainProductId: string;
  subProductId: string;
  sortNum: number;
  ratio?: number;
  isActive: boolean;
  modifiedBy?: string;
}

export interface IProductGroupDocument extends Document, IProductGroup {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  modifiedBy: string;
}
