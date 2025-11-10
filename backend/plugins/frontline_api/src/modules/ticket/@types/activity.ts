import { Document } from 'mongoose';

interface IActivityMetaData {
  newValue?: string;
  previousValue?: string;
}

export interface IActivity {
  action: string;
  contentId: string;
  module: string;
  metadata: IActivityMetaData;
  createdBy: string;
}

export interface IActivityUpdate extends IActivity {
  _id: string;
}

export interface IActivityDocument extends IActivity, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
