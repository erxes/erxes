import type {
  GetTicketPipelineQuery,
  GetTicketPipelinesQuery,
} from '~/gql/graphql';
import { z } from 'zod';
import {
  CREATE_PIPELINE_FORM_SCHEMA,
  UPDATE_PIPELINE_FORM_SCHEMA,
} from '@/settings/schema/pipeline';
import { PIPELINE_CONFIG_SCHEMA } from '../components/configs/schema';
import type { ITicketStatusPermissionChoice } from '@/status/types';

export interface PermissionState {
  _id: string;
  dayAfterCreated: boolean;
  branchOnly: boolean;
  myTicketsOnly: boolean;
  departmentOnly: boolean;
  selectedUsers: string[];
  visibility: 'public' | 'private';
  memberIds: string[];
}

export type IPipeline = NonNullable<
  NonNullable<
    NonNullable<GetTicketPipelinesQuery['getTicketPipelines']>['list']
  >[number]
>;

export type IPipelineDetail = NonNullable<
  GetTicketPipelineQuery['getTicketPipeline']
>;

export type TCreatePipelineForm = z.infer<typeof CREATE_PIPELINE_FORM_SCHEMA>;
export type TUpdatePipelineForm = z.infer<typeof UPDATE_PIPELINE_FORM_SCHEMA>;
export type TPipelineForm = TCreatePipelineForm | TUpdatePipelineForm;

export type TPipelineConfig = z.infer<typeof PIPELINE_CONFIG_SCHEMA>;

export type StatusItem = ITicketStatusPermissionChoice;

export * from './PipelineHotkeyScope';
