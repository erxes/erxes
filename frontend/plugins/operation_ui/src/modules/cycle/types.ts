import { addCycleSchema } from './validations';
import { z } from 'zod';

export interface ICycle {
  _id: string;
  description: string;
  donePercent: number;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
  name: string;
  startDate: string;
  statistics: any;
  teamId: string;
  unFinishedTasks: number;
}

export interface ICycleInput {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  teamId: string;
}

export type ICycleInputType = z.infer<typeof addCycleSchema>;

export interface ICycleProgressByMember {
  assigneeId: string;
  totalScope: number;
  totalStartedScope: number;
  totalCompletedScope: number;
}

export interface ICycleProgressByProject {
  projectId: string;
  totalScope: number;
  totalStartedScope: number;
  totalCompletedScope: number;
}
