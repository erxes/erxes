import { IAttachment } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface ISafeRemainder {
  branchId: string;
  departmentId: string;
  productCategoryId?: string;
  attachment?: IAttachment;
  filterField?: string;
  date: Date;
  description?: string;
  status: string;
  items?: { code: string; remainder: number }[];
}

export interface ISafeRemainderDocument extends ISafeRemainder, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}
