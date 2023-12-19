import { Document } from 'mongoose';

export interface IFlowCategory {
  name: string;
  code: string;
  order: string;
  description?: string;
  parentId?: string;
  attachment?: any;
  status?: string;
}

export interface IFlowCategoryDocument extends IFlowCategory, Document {
  _id: string;
  createdAt: Date;
}
