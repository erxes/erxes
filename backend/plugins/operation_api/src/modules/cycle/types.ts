import { Document } from 'mongoose';

export interface ICycle {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  teamId: string;
  isCompleted: boolean;
  isActive: boolean;
  statistics?: object;
  donePercent: number;
  unFinishedTasks: string[];
  number: number;
}

export interface ICycleDocument extends ICycle, Document {
  _id: string;
}
