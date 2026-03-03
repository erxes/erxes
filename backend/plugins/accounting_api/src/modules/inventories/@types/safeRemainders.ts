import { IAttachment } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface ISafeRemainderTrRule {
  accountId: string;
  customerType: string;
  customerId: string;
}

export interface ISafeRemEditFields {
  description?: string;
  incomeRule?: ISafeRemainderTrRule;
  outRule?: ISafeRemainderTrRule;
  saleRule?: ISafeRemainderTrRule;
}

export interface ISafeRemainder {
  branchId: string;
  departmentId: string;
  productCategoryId?: string;
  attachment?: IAttachment;
  filterField?: string;
  date: Date;
  description?: string;
  status: string;

  incomeRule?: ISafeRemainderTrRule;
  incomeTrId?: string;
  outRule?: ISafeRemainderTrRule;
  outTrId?: string;
  saleRule?: ISafeRemainderTrRule;
  saleTrId?: string;
}

export interface ISafeRemainderDocument extends ISafeRemainder, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}
