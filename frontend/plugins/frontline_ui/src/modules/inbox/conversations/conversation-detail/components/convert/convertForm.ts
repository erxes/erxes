import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { ConversationConvertType } from '@/inbox/conversations/types/conversationConvert';

export const CONVERT_TYPE_OPTIONS: Record<
  ConversationConvertType,
  {
    pluginName: string;
    createAction: string;
    stageMessage: string;
    multipleSelect: boolean;
    supportsDetails: boolean;
  }
> = {
  ticket: {
    pluginName: 'frontline',
    createAction: 'createTicket',
    stageMessage: 'Status is required',
    multipleSelect: false,
    supportsDetails: true,
  },
  deal: {
    pluginName: 'sales',
    createAction: 'dealsAdd',
    stageMessage: 'Stage is required',
    multipleSelect: true,
    supportsDetails: true,
  },
  task: {
    pluginName: 'operation',
    createAction: 'taskCreate',
    stageMessage: 'Status is required',
    multipleSelect: false,
    supportsDetails: false,
  },
};

export const CONVERT_TYPES = Object.keys(
  CONVERT_TYPE_OPTIONS,
) as ConversationConvertType[];

export const buildConvertSchema = (type: ConversationConvertType) =>
  z.object({
    channelId: z.string().optional(),
    boardId: z.string().optional(),
    pipelineId: z.string().optional(),
    teamId: z.string().optional(),
    stageId: z.string().min(1, CONVERT_TYPE_OPTIONS[type].stageMessage),
    name: z.string().trim().min(1, 'Name is required'),
    assignedUserIds: z.array(z.string()),
    branchIds: z.array(z.string()),
    departmentIds: z.array(z.string()),
    attachments: z.array(
      z.object({
        url: z.string(),
        name: z.string(),
        size: z.number(),
        type: z.string(),
      }),
    ),
    description: z.string().optional(),
  });

export type TConvertForm = z.infer<ReturnType<typeof buildConvertSchema>>;

export type TConvertFormReturn = UseFormReturn<TConvertForm>;

export type TConvertIdsFieldName =
  | 'assignedUserIds'
  | 'branchIds'
  | 'departmentIds';

export const toSingleValue = (value?: string[] | string | null) =>
  (Array.isArray(value) ? value[0] : value) || '';

export const toArrayValue = (value?: string[] | string | null) => {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
};
