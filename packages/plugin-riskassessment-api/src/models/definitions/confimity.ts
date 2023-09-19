import { IAttachment, attachmentSchema } from '@erxes/api-utils/src/types';
import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IRiskFormSubmissionDocument extends Document {
  _id: string;
  cardId: string;
  userId: string;
  formId: string;
  fieldId: string;
  value: Number;
  description: string;
  isFlagged?: boolean;
  attachments: IAttachment[];
}

export const formSubmissionSchema = new Schema({
  _id: field({ pkey: true }),
  cardId: field({ type: String, label: 'Card Id' }),
  cardType: field({ type: String, label: 'Card Type' }),
  userId: field({ type: String, label: 'User Id' }),
  contentType: field({
    type: String,
    label: 'content Type of submission',
    default: 'form'
  }),
  formId: field({ type: String, label: 'Form ID' }),
  indicatorId: field({ type: String, label: 'risk indicator ID' }),
  assessmentId: field({ type: String, label: 'risk assessment ID' }),
  fieldId: field({ type: String, label: 'Form Field Id' }),
  value: field({ type: String, lablel: 'Form Field Value' }),
  description: field({ type: String, label: 'Description', optional: true }),
  isFlagged: field({
    type: Boolean,
    label: 'is field flagged',
    optional: true
  }),
  attachments: field({
    type: [attachmentSchema],
    label: 'Attachments',
    optional: true
  })
});

export interface IAssessmentConformitiesDocument extends Document {
  _id: string;
  cardId: string;
  cardType: string;
  assessmentIds: string[];
  branchIds: string[];
  departmentIds: string[];
  operationIds: string[];
}
