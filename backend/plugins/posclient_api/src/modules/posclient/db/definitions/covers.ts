import { Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

const coverSummarySchema = new Schema(
  {
    _id: field({ pkey: true }),
    kind: field({ type: String, label: 'Kind' }),
    kindOfVal: field({ type: Number, label: 'Kind of value' }),
    value: field({ type: Number, label: 'Value' }),
    amount: field({ type: Number, label: 'Amount' }),
  },
  { _id: false },
);

const coverDetailSchema = new Schema({
  _id: field({ pkey: true }),
  paidType: field({ type: String, label: 'Paid type' }),
  paidSummary: field({ type: [coverSummarySchema], label: 'Summary' }),
  paidDetail: field({ type: Object, label: 'Detail' }),
});

export const coverSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    posToken: field({ type: String, label: 'Pos' }),
    status: field({ type: String, default: 'new', label: 'Status' }),
    beginDate: field({ type: Date, label: 'Begin date' }),
    endDate: field({ type: Date, label: 'End date' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    userId: field({ type: String, label: 'User' }),
    details: field({ type: [coverDetailSchema], label: 'Details' }),
    createdAt: field({ type: Date, label: 'Created' }),
    createdBy: field({ type: String, label: 'Created user' }),
    modifiedAt: field({ type: Date, label: 'Modified' }),
    modifiedBy: field({ type: String, label: 'Modified user' }),
    note: field({ type: String, optional: true, label: 'Note' }),
  }),
  'erxes_pos_slot',
);
