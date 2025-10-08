import { ICommonFields, ICommonDocument } from './common';
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
