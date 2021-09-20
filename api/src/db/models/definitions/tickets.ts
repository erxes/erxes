import { Document, Schema } from 'mongoose';
import { commonItemFieldsSchema, IItemCommonFields } from './boards';
import { field, schemaWrapper } from './utils';

export interface IComment {
  ticketId: string;
  title: string;
  content: string;
  userId?: string;
  customerId?: string;
  parentId?: string;
}

export interface ICommentDocument extends IComment, Document {
  _id: string;
  createdAt: Date;
}

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

    source: field({ type: String, label: 'Source' })
  })
);

export const commentSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    ticketId: field({ type: String, label: 'ticket' }),
    title: field({ type: String, label: 'Title' }),
    content: field({ type: String, label: 'Content' }),
    userId: field({ type: String, optional: true, label: 'User' }),
    customerId: field({ type: String, optional: true, label: 'Customer' }),
    parentId: field({ type: String, optional: true, label: 'Parent' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    })
  })
);
