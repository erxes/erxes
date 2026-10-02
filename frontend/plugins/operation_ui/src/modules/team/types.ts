import {
  TEAM_FORM_SCHEMA,
  TEAM_MEMBER_FORM_SCHEMA,
  TEAM_STATUS_FORM_SCHEMA,
} from '@/team/schemas';
import { z } from 'zod';
import {
  GetStatusesByTypeQuery,
  GetTeamMembersQuery,
  GetTeamsQuery,
} from '~/gql/graphql';

export enum TeamHotKeyScope {
  TeamSettingsPage = 'operation-team-page',
  TeamCreateSheet = 'operation-add-team',
}

export enum TeamEstimateTypes {
  NOT_IN_USE = '1',
  DEFAULT = '2',
  FIBONACCI = '3',
  EXPONENTIAL = '4',
}

export type ITeam = NonNullable<
  NonNullable<GetTeamsQuery['getTeams']>[number]
>;

export type ITeamMember = NonNullable<
  NonNullable<GetTeamMembersQuery['getTeamMembers']>[number]
>;

export type ITeamStatus = NonNullable<
  NonNullable<GetStatusesByTypeQuery['getStatusesByType']>[number]
>;

export type TTeamForm = z.infer<typeof TEAM_FORM_SCHEMA>;

export type TTeamMemberForm = z.infer<typeof TEAM_MEMBER_FORM_SCHEMA>;

export type TTeamStatusForm = z.infer<typeof TEAM_STATUS_FORM_SCHEMA>;
