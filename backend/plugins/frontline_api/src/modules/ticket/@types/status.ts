import { Document } from 'mongoose';

export interface IStatus {
  name: string;
  channelId: string;
  pipelineId: string;
  description?: string;
  color?: string;
  type: number;
  order: number;
}

export interface IStatusEditInput extends IStatus {
  _id: string;
  name: string;
  channelId: string;
  pipelineId: string;
  description?: string;
  color?: string;
  type: number;
  order: number;
}

export interface IStatusDocument extends IStatus, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStatusFilter {
  channelId: string;
  pipelineId: string;
  type?: number;
}
