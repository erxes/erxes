import { Document } from 'mongoose';

export interface ICoverSummary {
  _id?: string;
  kind: string;
  kindOfVal: number;
  value: number;
  amount: number;
}

export interface ICoverDetail {
  _id?: string;
  paidType: string;
  paidSummary: ICoverSummary[];
  calcSummary: number;
  paidDetail: any;
}

export interface ICover {
  _id?: string;
  posToken: string;
  status: string;
  beginDate: Date;
  endDate: Date;
  description: string;
  userId: string;
  details: ICoverDetail[];
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
  note?: string;
}

export interface ICoverDocument extends ICover, Document {
  _id: string;
}
