import { commonSchema, ICommonFields, ICommonDocument } from './common';
import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { ASSIGNMENT_STATUS } from './constants';

export interface IAssignment extends ICommonFields {
  segmentIds?: string[];
  status?: string;
  voucherId?: string;
  voucherCampaignId?: string;
}

export interface IAssignmentDocument
  extends IAssignment,
    ICommonDocument,
    Document {
  _id: string;
}

export const assignmentSchema = schemaHooksWrapper(
  new Schema({
    ...commonSchema,
    status: field({
      type: String,
      enum: ASSIGNMENT_STATUS.ALL,
      default: 'new'
    }),
    segmentIds: field({ type: [String], label: 'Segment Data' }),
    voucherCampaignId: field({
      type: String,
      label: 'Source Voucher Campaign',
      optional: true
    }),
    voucherId: field({ type: String, label: 'Won Voucher', optional: true })
  }),
  'erxes_loyalty_assignments'
);
