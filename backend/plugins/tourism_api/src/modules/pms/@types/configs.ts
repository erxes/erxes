import { Document } from 'mongoose';

export interface IConfig {
  code: string;
  value: string;
  pipelineId: string;
}

export interface IConfigDocument extends IConfig, Document {
  _id: string;
}
