import { Document } from 'mongoose';

export interface ILabelObjectParams {
  labelIds: string[];
  targetId: string;
  collection: any;
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
