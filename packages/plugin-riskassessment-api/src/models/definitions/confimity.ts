import { Document, Schema } from 'mongoose';
import { field } from './utils';

type RiskConformityFormType = {
  status: string;
  statusColor: string;
  resultScores: string;
  formId: string;
};
export interface IRiskConformityDocument extends Document {
  _id: string;
  cardId: string;
  cardType: string;
  riskAssessmentId: string;
  riskAssessment?: any;
  riskIndicatorIds: string[];
  riskIndicators: any[];
}

export interface IRiskFormSubmissionDocument extends Document {
  _id: string;
  cardId: string;
  userId: string;
  formId: string;
  fieldId: string;
  value: Number;
}

export const riskConformitySchema = new Schema({
  _id: field({ pkey: true }),
  cardId: field({ type: String, label: 'Card Id' }),
  cardType: field({ type: String, label: 'Card Type' }),
  riskAssessmentId: field({ type: String, label: ' Risk Assessment Id' }),
  createdAt: field({ type: Date, label: 'Created At', default: Date.now })
});

export const riskConformityFormSubmissionSchema = new Schema({
  _id: field({ pkey: true }),
  cardId: field({ type: String, label: 'Card Id' }),
  cardType: field({ type: String, label: 'Card Type' }),
  userId: field({ type: String, label: 'User Id' }),
  formId: field({ type: String, label: 'Form ID' }),
  riskIndicatorId: field({ type: String, label: 'risk indicator ID' }),
  fieldId: field({ type: String, label: 'Form Field Id' }),
  value: field({ type: String, lablel: 'Form Field Value' })
});
