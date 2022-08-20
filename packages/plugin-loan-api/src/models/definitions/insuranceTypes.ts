import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';
export interface IInsuranceType {
  code: string;
  name: string;
  description: string;
  companyId: string;
  percent: number;
  yearPercents: number[];
  createdBy: string;
  createdAt: Date;
}

export interface IInsuranceTypeDocument extends IInsuranceType, Document {
  _id: string;
}

export const insuranceTypeSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'Code', unique: true }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    companyId: field({ type: String, label: 'Company' }),
    percent: field({ type: Number, label: 'Percent' }),
    yearPercents: field({ type: [Number], label: 'percent of years' }),
    createdBy: field({ type: String, label: 'Created By' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    })
  }),
  'erxes_insuranceTypeSchema'
);
