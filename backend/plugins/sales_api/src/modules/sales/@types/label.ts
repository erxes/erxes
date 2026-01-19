import { Document } from 'mongoose';

export interface ILabelObjectParams {
  labelIds: string[];
  dealId: string;
}

export interface IPipelineLabel {
  name: string;
  colorCode: string;
  pipelineId: string;
  userId?: string;
}

export interface IPipelineLabelDocument extends IPipelineLabel, Document {
  _id: string;
  createdAt?: Date;
}
