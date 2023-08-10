import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';

export interface IClassification {
  description: string;
  invDate: Date;
  total: number;
  classification: string;
  newClassification: string;
  dtl: {
    amount: number;
    contractId: string;
    currency: string;
  }[];
}

export interface IClassificationDocument extends IClassification, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
}

export const classificationSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    number: field({
      type: String,
      label: 'Number',
      index: true
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    invDate: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    total: field({ type: Number, min: 0, label: 'total' }),
    classification: field({ type: String, label: 'classification' }),
    newClassification: field({ type: String, label: 'newClassification' }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at'
    }),
    createdBy: { type: String, optional: true, label: 'created member' },
    dtl: field({
      type: [
        {
          amount: Number,
          contractId: String,
          currency: String
        }
      ],
      optional: true,
      label: 'contract info'
    })
  }),
  'erxes_classificationSchema'
);
