import { Document } from 'mongoose';

export interface IInsurance {
  name?: string;
}

export interface IInsuranceDocument extends IInsurance, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
