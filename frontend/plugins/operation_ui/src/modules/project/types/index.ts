import { addProjectSchema } from '@/project/types/validations';
import type {
  GetMilestonesQuery,
  GetProjectQuery,
  GetProjectsQuery,
} from '~/gql/graphql';
import { z } from 'zod';

export type IProject = NonNullable<
  NonNullable<NonNullable<GetProjectsQuery['getProjects']>['list']>[number]
>;

export type IProjectDetail = NonNullable<GetProjectQuery['getProject']>;

export enum ProjectPageTypes {
  All = 'all',
  Team = 'team',
}

export type TAddProject = z.infer<typeof addProjectSchema>;
export * from '@/project/types/validations';

export interface IProjectProgress {
  totalScope: number;
  totalStartedScope: number;
  totalCompletedScope: number;
}

export interface IProjectProgressByMember {
  assigneeId: string;
  totalScope: number;
  totalStartedScope: number;
  totalCompletedScope: number;
}

export interface IProjectProgressByTeam {
  teamId: string;
  totalScope: number;
  totalStartedScope: number;
  totalCompletedScope: number;
}

export type IMilestone = NonNullable<
  NonNullable<NonNullable<GetMilestonesQuery['milestones']>['list']>[number]
>;

export interface IMilestoneProgress {
  totalScope: number;
  totalStartedScope: number;
  totalCompletedScope: number;
}
