import type { GetTaskQuery, GetTasksQuery } from '~/gql/graphql';
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

export type ITask = NonNullable<
  NonNullable<NonNullable<GetTasksQuery['getTasks']>['list']>[number]
>;

export type ITaskDetail = NonNullable<GetTaskQuery['getTask']>;

export interface ITaskStatus {
  value: string;
  label: string;
  color: string;
  type: number;
}

export type TAddTask = z.infer<typeof addTaskSchema>;
export * from '@/task/types/validations';
