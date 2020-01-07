import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';
import { field, schemaWrapper } from './utils';

export interface ITicket extends IItemCommonFields {
  source?: string;
}

export interface ITicketDocument extends ITicket, Document {
  _id: string;
}

// Mongoose schemas =======================
export const ticketSchema = schemaWrapper(
  new Schema({
    ...commonItemFieldsSchema,

    source: field({ type: String, label: 'Source' }),
  }),
);
