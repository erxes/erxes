import { addTaskSchema } from '@/task/types/validations';
import { z } from 'zod';

export interface IEstimateChoice {
  label: string;
  value: number;
}

export interface INote {
  _id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  contentId: string;
  mentions: string[];
  updatedAt: string;
}

export interface ITask {
  _id: string;
  name: string;
  number: string;
  tagIds: string[];
  createdAt: string;
  priority: number;
  status: string;
  startDate?: string;
  targetDate?: string;
  assigneeId: string;
  teamId: string;
  projectId: string;
  estimatePoint: number;
  updatedAt: string;
  cycleId?: string;
}

export interface ITaskStatus {
  value: string;
  label: string;
  color: string;
  type: number;
}

export type TAddTask = z.infer<typeof addTaskSchema>;
export * from '@/task/types/validations';
