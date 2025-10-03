import { addProjectSchema } from '@/project/types/validations';
import { z } from 'zod';

export interface IProject {
  _id: string;
  name: string;
  icon: string;
  tagIds: string[];
  createdAt: string;
  priority: number;
  status: number;
  targetDate: Date;
  startDate: Date;
  leadId: string;
  teamIds: string[];
  description: string;
}

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
