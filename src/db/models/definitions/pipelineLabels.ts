import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IPipelineLabel {
  name: string;
  colorCode: string;
  pipelineId: string;
  createdBy?: string;
  createdDate?: Date;
}

export interface IPipelineLabelDocument extends IPipelineLabel, Document {
  _id: string;
}

export const pipelineLabelSchema = new Schema({
  _id: field({ pkey: true }),

  name: field({ type: String }),
  colorCode: field({ type: String }),
  pipelineId: field({ type: String }),
  createdBy: field({ type: String }),
  createdAt: field({
    type: Date,
    default: new Date(),
  }),
});
