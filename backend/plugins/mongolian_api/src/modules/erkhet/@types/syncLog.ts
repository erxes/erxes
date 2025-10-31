import { Document } from 'mongoose';

export interface ISyncLog {
  contentType: string;
  contentId: string;
  createdAt: Date;
  createdBy?: string;
  consumeData: any;
  consumeStr: string;
  sendData?: any;
  sendStr?: string;
  responseData?: any;
  responseStr?: string;
  error?: string;
}

export interface ISyncLogDocument extends ISyncLog, Document {
  _id: string;
  id: string;
}
