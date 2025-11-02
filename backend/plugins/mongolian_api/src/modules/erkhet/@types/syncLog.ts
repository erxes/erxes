import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
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
}

export interface ISyncHistoryParams extends ICursorPaginateParams {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  contentType?: string;
  contentId?: string;
  searchConsume?: string;
  searchSend?: string;
  searchResponse?: string;
  searchError?: string;
}
