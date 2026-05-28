import { Document } from 'mongoose';

export interface ITask {
  title: string;
  description?: string;
  assigneeId?: string;
  branchId: string;
  dueDate?: Date;
  status?: string;
  priority?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskDocument extends ITask, Document {
  _id: string;
}
