import { Document } from 'mongoose';

export interface IProductCategory {
  name: string;
  code: string;
  order: string;
  scopeBrandIds?: string[];
  description?: string;
  meta?: string;
  parentId?: string;
  attachment?: any;
  status?: string;
  maskType?: string;
  mask?: any;
  isSimilarity?: boolean;
  similarities?: {
    id: string;
    groupId: string;
    fieldId: string;
    title: string;
  }[];
}

export interface IProductCategoryDocument extends IProductCategory, Document {
  _id: string;
  createdAt: Date;
}
