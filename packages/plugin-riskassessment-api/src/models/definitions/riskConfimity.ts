import { Document, Schema } from 'mongoose'
import { field } from './utils'

export interface IRiskConfirmityDocument extends Document {
  _id: string;
  cardId: string;
  riskAssessmentIds: string;
}

export const riskConfirmitySchema = new Schema({
  _id: field({ pkey: true }),
  cardId: field({ type: String, label: 'Card Id' }),
  riskAssessmentId: field({ type: String, label: 'Answer Risk assessment Ids' }),
  createdAt:field({type : Date, label: 'Created At', default:new Date }),
});
