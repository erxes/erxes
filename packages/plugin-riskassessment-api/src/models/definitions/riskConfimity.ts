import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IRiskConfirmityDocument extends Document {
  _id: string;
  card: string;
  riskConfirmityId: string;
}

export const riskConfirmitySchema = new Schema({
  _id: field({ pkey: true }),
  cardId: field({ type: String, label: 'Card Id' }),
  riskAssessmentId: field({ type: String, label: 'Answer Risk assessment Id' }),
});
