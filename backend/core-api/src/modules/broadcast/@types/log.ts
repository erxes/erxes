import { Document } from 'mongoose';

export type MessageType = 'regular' | 'success' | 'failure';

export interface ILog {
  engageMessageId: string;
  message: string;
  type: MessageType;
}

export interface ILogDocument extends ILog, Document {}
