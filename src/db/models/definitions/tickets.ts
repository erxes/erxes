import { Document, Schema } from 'mongoose';
import { field } from '../utils';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';

export interface ITicket extends IItemCommonFields {
  priority?: string;
  source?: string;
}

export interface ITicketDocument extends ITicket, Document {
  _id: string;
}

// Mongoose schemas =======================
export const ticketSchema = new Schema({
  ...commonItemFieldsSchema,

  priority: field({ type: String }),
  source: field({ type: String }),
});
