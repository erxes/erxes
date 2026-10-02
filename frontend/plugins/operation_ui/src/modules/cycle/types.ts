import { addCycleSchema } from './validations';
import type {
  GetCycleProgressByMemberQuery,
  GetCycleProgressByProjectQuery,
  GetCycleProgressChartQuery,
  GetCycleProgressQuery,
} from '~/gql/graphql';
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

export type ICycleProgressByMember = NonNullable<
  GetCycleProgressByMemberQuery['getCycleProgressByMember']
>[number];

export type ICycleProgressByProject = NonNullable<
  GetCycleProgressByProjectQuery['getCycleProgressByProject']
>[number];

export type ICycleProgressChart = NonNullable<
  GetCycleProgressChartQuery['getCycleProgressChart']
>;

export type ICycleProgress = NonNullable<
  GetCycleProgressQuery['getCycleProgress']
>;

export interface ICycleStatistics {
  progress?: ICycleProgress;
  progressByMember?: ICycleProgressByMember[];
  progressByProject?: ICycleProgressByProject[];
  chartData?: ICycleProgressChart;
}
