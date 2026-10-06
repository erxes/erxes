import { addProjectSchema } from '@/project/types/validations';
import type {
  GetMilestoneProgressQuery,
  GetMilestonesQuery,
  GetProjectProgressByMemberQuery,
  GetProjectProgressByTeamQuery,
  GetProjectProgressQuery,
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

export type IProjectProgress = NonNullable<
  GetProjectProgressQuery['getProjectProgress']
>;

export type IProjectProgressByMember =
  GetProjectProgressByMemberQuery['getProjectProgressByMember'][number];

export type IProjectProgressByTeam =
  GetProjectProgressByTeamQuery['getProjectProgressByTeam'][number];

export type IMilestone = NonNullable<
  NonNullable<NonNullable<GetMilestonesQuery['milestones']>['list']>[number]
>;

export type IMilestoneProgress = NonNullable<
  NonNullable<GetMilestoneProgressQuery['milestoneProgress']>[number]
>;
