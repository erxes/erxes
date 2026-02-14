import { Document } from 'mongoose';

export interface ITeam {
  icon: string;
  name: string;
  description: string;
  estimateType: number;
  cycleEnabled?: boolean;
  triageEnabled?: boolean;
}

export interface ITeamDocument extends ITeam, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeamFilter extends ITeam {
  teamId: string;
  userId: string;
  teamIds: string[];
  projectId: string;
  isTriageEnabled: boolean;
}

export enum TeamMemberRoles {
  ADMIN = 'admin',
  MEMBER = 'member',
  LEAD = 'lead',
}

export interface ITeamMember {
  memberId: string;
  teamId: string;
  // ** Deprecated
  // role: TeamMemberRoles;
}

export interface ITeamMemberDocument extends ITeamMember, Document {
  _id: string;
}

export enum TeamEstimateTypes {
  NOT_IN_USE = 1,
  DEFAULT = 2,
  FIBONACCI = 3,
  EXPONENTIAL = 4,
}

export interface IEstimateChoice {
  value: number;
  label: string;
}
