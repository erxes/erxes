import { Document } from 'mongoose';

export interface IAssignment {
  name?: string;
}

export interface IAssignmentDocument extends IAssignment, Document {
  createdAt: Date;
  updatedAt: Date;
}
