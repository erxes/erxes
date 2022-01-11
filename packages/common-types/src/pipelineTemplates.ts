import { Document } from 'mongoose';

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
  createdBy?: string;
  createdDate: Date;
}

export interface IPipelineTemplateDocument extends IPipelineTemplate, Document {
  _id: string;
}
