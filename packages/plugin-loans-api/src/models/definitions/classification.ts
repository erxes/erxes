import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';

export interface IClassification {
  description: string;
  invDate: Date;
  total: number;
  classification: string;
  newClassification: string;
  contractId: string;
  dtl: any
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
    createdBy: field({ type: String, optional: true, label: 'created member' }),
    contractId: field({
      type: String,
      label: 'contractId'
    })
  }),
  'erxes_classificationSchema'
);
