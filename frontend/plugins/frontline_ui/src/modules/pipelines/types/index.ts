import { IUser } from 'ui-modules';
import { z } from 'zod';
import {
  CREATE_PIPELINE_FORM_SCHEMA,
  UPDATE_PIPELINE_FORM_SCHEMA,
} from '@/settings/schema/pipeline';
import { PIPELINE_CONFIG_SCHEMA } from '../components/configs/schema';
export interface IPipeline {
  _id: string;
  channelId: string;
  createdAt: string;
  description: string;
  name: string;
  updatedAt: string;
  userId: string;
  createdUser: IUser;
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

export * from './PipelineHotkeyScope';
