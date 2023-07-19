import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { ITransactionItem, ITransactionItemDocument } from './transactionItems';

export interface ITransactionCreateParams extends ITransaction {
  products: {
    productId: string;
    count: number;
    preCount: number;
    uom: string;
    isDebit: boolean;
  }[];
}

export interface ITransaction {
  date: Date;
  number: string;
  description: string;
  journal: string;
  parentId: string;
  ptrId: string;
  childData: any;
  contactType: string;
  contactId: string;
  status: string;
  contentType: string;
  contentId: string;
  taxInfo: any;
  assignedUserIds: string[];
  paymentData: any;
  createdAt?: Date;
  createdBy?: String;
  modifiedAt?: Date;
  modifiedBy?: String;
}

export interface ITransactionInput extends ITransaction {
  items: ITransactionItem[] | ITransactionItemDocument[];
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  createdAt: Date;
  createdBy: String;
  modifiedAt: Date;
  modifiedBy: String;
}

export const transactionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    date: field({ type: Date, label: 'date' }),
    number: field({ type: String, default: '', label: 'number' }),
    description: field({ type: String, label: 'description' }),
    journal: field({ type: String, label: 'journal' }),
    parentId: field({ type: String, label: 'parentId' }),
    ptrId: field({ type: String, label: 'ptrId' }),
    childData: field({ type: Object, label: 'childData' }),
    contactType: field({ type: String, label: 'contactType' }),
    contactId: field({ type: String, label: 'contactId' }),
    status: field({ type: String, label: 'status' }),
    contentType: field({ type: String, label: 'contentType' }),
    contentId: field({ type: String, label: 'contentId' }),
    taxInfo: field({ type: Object, label: 'taxInfo' }),
    assignedUserIds: field({ type: [String], label: 'assignedUserIds' }),
    paymentData: field({ type: Object, label: 'paymentData' }),

    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created by' },
    modifiedAt: { type: Date, default: new Date(), label: 'Modified date' },
    modifiedBy: { type: String, label: 'Modified by' }
  }),
  'erxes_transactions'
);

// for transactionSchema query. increases search speed, avoids in-memory sorting
transactionSchema.index({
  contentType: 1,
  contentId: 1
});
