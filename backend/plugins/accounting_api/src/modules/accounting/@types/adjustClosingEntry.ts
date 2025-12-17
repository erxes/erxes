import { Document } from 'mongoose';

export interface IClosingDetailEntry {
  _id?: string;
  accountId: string;
  balance: number;
  percent: number;
  mainAccTrId?: string;
  integrateTrId?: string;
}

export interface IAdjustClosingDetail {
  _id?: string;
  branchId?: string;
  departmentId?: string;
  entries: IClosingDetailEntry[];
  closeIntegrateTrId?: string;
  periodGLTrId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdjustClosing {
  _id?: string;
  status: 'draft' | 'publish' | 'warning' | 'complete';
  date: Date;
  beginDate: Date;
  description?: string;

  details?: IAdjustClosingDetail[];

  integrateAccountId: string;
  periodGLAccountId: string;
  earningAccountId: string;
  taxPayableAccountId: string;

  taxImpactValue: number;

  closePeriodTrId?: string;
  earningTrId?: string;
  taxPayableTrId?: string;

  createdBy: string;
  modifiedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdjustClosingDocument extends IAdjustClosing, Document {
  _id: string;
}
