import { commonSchema, ICommonFields, ICommonDocument } from './common';
import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IAssignment extends ICommonFields {
  segmentIds?: string[];
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
    segmentIds: field({ type: [String], label: 'Segment Data' })
  }),
  'erxes_loyalty_assignments'
);
