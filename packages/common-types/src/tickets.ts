import { Document } from 'mongoose';

import { IItemCommonFields } from './boards';

export interface ITicket extends IItemCommonFields {
  source?: string;
}

export interface ITicketDocument extends ITicket, Document {
  _id: string;
}
