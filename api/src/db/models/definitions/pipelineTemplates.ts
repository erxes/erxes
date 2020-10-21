import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IPipelineTemplateStage {
  _id: string;
  name: string;
  formId: string;
}

export interface IPipelineTemplate {
  name: string;
  description?: string;
  type: string;
  isDefinedByErxes: boolean;
  stages: IPipelineTemplateStage[];
  createdBy: string;
  createdDate: Date;
}

export interface IPipelineTemplateDocument extends IPipelineTemplate, Document {
  _id: string;
}

export const stageSchema = new Schema(
  {
    _id: field({ type: String }),
    name: field({ type: String, label: 'Stage name' }),
    formId: field({ type: String, optional: true, label: 'Form' }),
    order: field({ type: Number, label: 'Order' }),
  },
  { _id: false },
);

export const pipelineTemplateSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  type: field({ type: String, label: 'Type' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  stages: field({ type: [stageSchema], default: [], label: 'Stages' }),
  isDefinedByErxes: field({ type: Boolean, default: false, label: 'Is defined by erxes' }),
  createdBy: field({ type: String, label: 'Created by' }),
  createdAt: field({
    type: Date,
    default: new Date(),
    label: 'Created at',
  }),
});
