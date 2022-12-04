import { commonSchema, ICommonFields, ICommonDocument } from './common';
import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper } from './utils';

export interface IAssignment extends ICommonFields {}

export interface IAssignmentDocument
  extends IAssignment,
    ICommonDocument,
    Document {
  _id: string;
}

export const assignmentSchema = schemaHooksWrapper(
  new Schema({
    ...commonSchema
  }),
  'erxes_loyalty_assignments'
);
