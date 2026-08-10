import { Document } from 'mongoose';

export interface IStatus {
  name: string;
  pipelineId: string;
  description?: string;
  color?: string;
  type: number;
  order: number;
  visibilityType?: string;
  memberIds?: string[];
  canMoveMemberIds?: string[];
  canEditMemberIds?: string[];
  departmentIds?: string[];
  state?: string;
  probability?: number;
}

export interface IStatusEditInput extends IStatus {
  _id: string;
  name: string;
  pipelineId: string;
  description?: string;
  color?: string;
  type: number;
  order: number;
  visibilityType?: string;
  memberIds?: string[];
  canMoveMemberIds?: string[];
  canEditMemberIds?: string[];
  departmentIds?: string[];
  state?: string;
  probability?: number;
}

export interface IStatusDocument extends IStatus, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStatusFilter {
  pipelineId: string;
  type?: number;
}
