import { Document } from 'mongoose';

export interface IStatus {
  name: string;
  teamId: string;
  description?: string;
  color?: string;
  type: number;
  order: number;
}

export interface IStatusEditInput {
  _id: string;
  name: string;
  teamId: string;
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
  teamId: string;
  type: number;
}
