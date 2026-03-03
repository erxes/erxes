import { IAttachment } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

interface ITrRule {
  accountId: string;
  customerType: string;
  customerId: string;
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

  incomeRule?: ITrRule;
  incomeTrId?: string;
  outRule?: ITrRule;
  outTrId?: string;
  saleRule?: ITrRule;
  saleTrId?: string;
}

export interface ISafeRemainderDocument extends ISafeRemainder, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}
