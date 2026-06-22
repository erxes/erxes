import { Document } from 'mongoose';

export interface IFxaInstanceLog {
  fxaInstanceId: string;
  fixedAssetId?: string;
  eventType: string;
  eventDate: Date;
  description?: string;

  transactionId?: string;
  transactionDetailId?: string;

  fromBranchId?: string;
  toBranchId?: string;
  fromDepartmentId?: string;
  toDepartmentId?: string;
  fromResponsibleUserId?: string;
  toResponsibleUserId?: string;
  fromStatus?: string;
  toStatus?: string;

  createdAt?: Date;
  createdBy?: string;
}

export interface IFxaInstanceLogDocument extends IFxaInstanceLog, Document {
  _id: string;
  createdAt: Date;
}
