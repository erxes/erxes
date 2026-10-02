import type {
  EstimateChoisesQuery,
  GetStatusByTeamQuery,
  GetTaskQuery,
  GetTasksQuery,
} from '~/gql/graphql';
import { addTaskSchema } from '@/task/types/validations';
import { z } from 'zod';

export type IEstimateChoice = NonNullable<
  NonNullable<EstimateChoisesQuery['getTeamEstimateChoises']>[number]
>;

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

export type ITaskStatus = NonNullable<
  NonNullable<GetStatusByTeamQuery['getStatusesChoicesByTeam']>[number]
>;

export type TAddTask = z.infer<typeof addTaskSchema>;
export * from '@/task/types/validations';
