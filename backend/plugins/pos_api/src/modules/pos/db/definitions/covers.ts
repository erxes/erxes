import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

const coverSummarySchema = new Schema(
  {
    _id: mongooseStringRandomId,
    kind: { type: String, label: 'Kind' },
    kindOfVal: { type: Number, label: 'Kind of value' },
    value: { type: Number, label: 'Value' },
    amount: { type: Number, label: 'Amount' }
  },
  { _id: false }
);

const coverDetailSchema = new Schema({
  _id: mongooseStringRandomId,
  paidType: { type: String, label: 'Paid type' },
  paidSummary: { type: [coverSummarySchema], label: 'Summary' },
  paidDetail: { type: Object, label: 'Detail' }
});

export const coverSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    posToken: { type: String, label: 'Pos' },
    status: { type: String, default: 'new', label: 'Status' },
    beginDate: { type: Date, label: 'Begin date' },
    endDate: { type: Date, label: 'End date' },
    description: { type: String, label: 'Description' },
    userId: { type: String, label: 'Assegnee' },
    details: { type: [coverDetailSchema], label: 'Details' },
    createdAt: { type: Date, label: 'Created' },
    createdBy: { type: String, label: 'Created user' },
    modifiedAt: { type: Date, label: 'Modified' },
    modifiedBy: { type: String, label: 'Modified user' },
    note: { type: String, label: 'Note' }
  })
);
