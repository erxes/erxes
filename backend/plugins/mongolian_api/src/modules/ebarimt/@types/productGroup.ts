import { Document } from 'mongoose';

export interface IProductGroup {
  _id?: string;
  id?: string;
  mainProductId: string;
  subProductId: string;
  sortNum: number;
  ratio?: number;
  isActive: boolean;
  modifiedBy?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IProductGroupUpdate extends IProductGroup {
  _id: string;
}

export interface IProductGroupDocument extends Omit<IProductGroup, 'id'>, Document {
  _id: string;
  id: string;
  createdAt: Date;
  modifiedAt: Date;
}