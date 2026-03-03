import { IUser } from 'ui-modules';
import { z } from 'zod';
import {
  CREATE_PIPELINE_FORM_SCHEMA,
  UPDATE_PIPELINE_FORM_SCHEMA,
} from '@/settings/schema/pipeline';
import { PIPELINE_CONFIG_SCHEMA } from '../components/configs/schema';

export interface PermissionState {
  _id: string;
  dayAfterCreated: boolean;
  branchOnly: boolean;
  myTicketsOnly: boolean;
  departmentOnly: boolean;
  allowAllUsers: boolean;
  selectedUsers: string[];
  visibility: 'public' | 'private';
  memberIds: string[];
}

export interface IPipeline {
  _id: string;
  channelId: string;
  createdAt: string;
  description: string;
  name: string;
  updatedAt: string;
  userId: string;
  createdUser: IUser;
  state: string;
  isCheckDate: boolean;
  isCheckUser: boolean;
  isCheckDepartment: boolean;
  isCheckBranch: boolean;
  isHideName: boolean;
  excludeCheckUserIds: string[];
  numberConfig: string;
  numberSize: string;
  nameConfig: string;
  lastNum: string;
  departmentIds: string[];
  branchIds: string[];
  tagId: string;
  visibility: 'public' | 'private';
  memberIds: string[];
}

export interface ITicketsPipelineFilter {
  filter: {
    channelId?: string;
    cursor?: string;
    aggregationPipeline?: JSON;
    cursorMode?: 'inclusive' | 'exclusive';
    direction?: 'forward' | 'backward';
    limit?: number;
    name?: string;
    orderBy?: any;
    sortMode?: string;
    userId?: string;
  };
}

export enum ContactType {
  CUSTOMER = 'customer',
  COMPANY = 'company',
}

export type TCreatePipelineForm = z.infer<typeof CREATE_PIPELINE_FORM_SCHEMA>;
export type TUpdatePipelineForm = z.infer<typeof UPDATE_PIPELINE_FORM_SCHEMA>;
export type TPipelineForm = TCreatePipelineForm | TUpdatePipelineForm;

export type TPipelineConfig = z.infer<typeof PIPELINE_CONFIG_SCHEMA>;

export interface StatusItem {
  value: string;
  label: string;
  color: string;
  type: number;
}

export * from './PipelineHotkeyScope';
