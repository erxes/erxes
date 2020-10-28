import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IPipelineLabel {
  name: string;
  colorCode: string;
  pipelineId: string;
  createdBy?: string;
  createdAt?: Date;
}

export interface IPipelineLabelDocument extends IPipelineLabel, Document {
  _id: string;
}

export const pipelineLabelSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  colorCode: field({ type: String, label: 'Color code' }),
  pipelineId: field({ type: String, label: 'Pipeline' }),
  createdBy: field({ type: String, label: 'Created by' }),
  createdAt: field({
    type: Date,
    default: new Date(),
    label: 'Created at'
  })
});
