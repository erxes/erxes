import { Document } from 'mongoose';

export interface IBundleCondition {
  code?: string;
  name?: string;
  description?: string;
  userId?: string;
  isDefault?: boolean;
}

export interface IBundleConditionDocument extends IBundleCondition, Document {
  _id: string;
  createdAt: Date;
}
