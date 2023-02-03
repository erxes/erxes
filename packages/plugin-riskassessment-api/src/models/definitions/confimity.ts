import { Document, Schema } from 'mongoose';
import { calculateMethodsSchema } from './indicator';
import { field } from './utils';

export interface IRiskFormSubmissionDocument extends Document {
  _id: string;
  cardId: string;
  userId: string;
  formId: string;
  fieldId: string;
  value: Number;
}

export const riskConformityFormSubmissionSchema = new Schema({
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
  value: field({ type: String, lablel: 'Form Field Value' })
});
