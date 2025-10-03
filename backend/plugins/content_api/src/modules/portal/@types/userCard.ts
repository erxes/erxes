import { Document } from 'mongoose';

export interface IUserCard {
  contentType: 'deal' | 'task' | 'ticket' | 'purchase';
  contentTypeId: string;
  portalUserId: string;
  status?:
    | 'participating'
    | 'invited'
    | 'left'
    | 'rejected'
    | 'won'
    | 'lost'
    | 'completed';
  paymentStatus?: 'paid' | 'unpaid';
  paymentAmount?: number;
  offeredAmount?: number;
  hasVat?: boolean;
}

export interface IUserCardDocument extends IUserCard, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}
