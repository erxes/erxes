import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IRiskConfirmityDocument extends Document {
  _id: string;
  cardId: string;
  riskAssessmentIds: string;
}

export interface IRiskFormSubmissionDocument extends Document {
  _id: String;
  cardId: String;
  userId: String;
  formId: String;
  fieldId: String;
  value: Number;
}

export const riskConfirmitySchema = new Schema({
  _id: field({ pkey: true }),
  cardId: field({ type: String, label: 'Card Id' }),
  cardType: field({ type: String, label: 'Card Type' }),
  riskAssessmentId: field({ type: String, label: 'Answer Risk assessment Ids' }),
  createdAt: field({ type: Date, label: 'Created At', default: new Date() })
});

export const riskConfirmityFormSubmissionSchema = new Schema({
  _id: field({ pkey: true }),
  cardId: field({ type: String, label: 'Card Id' }),
  cardType: field({ type: String, label: 'Card Type' }),
  userId: field({ type: String, label: 'User Id' }),
  formId: field({ type: String, label: 'Form ID' }),
  riskAssessmentId: field({ type: String, label: 'risk assessment ID' }),
  fieldId: field({ type: String, label: 'Form Field Id' }),
  value: field({ type: String, lablel: 'Form Field Value' })
});
