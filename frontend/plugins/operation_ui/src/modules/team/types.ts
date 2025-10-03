import {
  TEAM_FORM_SCHEMA,
  TEAM_MEMBER_FORM_SCHEMA,
  TEAM_STATUS_FORM_SCHEMA,
} from '@/team/schemas';
import { z } from 'zod';
import { IUser } from 'ui-modules';

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

export interface ITeam {
  _id: string;
  name: string;
  icon: string;
  description: string;
  estimateType: TeamEstimateTypes;
  createdAt: string;
  updatedAt: string;
  cycleEnabled: boolean;
  taskCount: number;
  memberCount: number;
}

export interface ITeamMember {
  _id: string;
  memberId: string;
  teamId: string;

  member: IUser;
  role: string;
}

export interface ITeamStatus {
  _id: string;
  name: string;
  description: string;
  color: string;
  order: number;
  type: number;
}

export type TTeamForm = z.infer<typeof TEAM_FORM_SCHEMA>;

export type TTeamMemberForm = z.infer<typeof TEAM_MEMBER_FORM_SCHEMA>;

export type TTeamStatusForm = z.infer<typeof TEAM_STATUS_FORM_SCHEMA>;
