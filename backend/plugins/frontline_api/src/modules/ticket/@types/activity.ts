import { Document } from 'mongoose';

interface IActivityFormSubmissionField {
  label: string;
  value: unknown;
}

interface IActivityMetaData {
  newValue?: string;
  previousValue?: string;
  conversationId?: string;
  ticketId?: string;
  formId?: string;
  formTitle?: string;
  submissions?: IActivityFormSubmissionField[];
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
