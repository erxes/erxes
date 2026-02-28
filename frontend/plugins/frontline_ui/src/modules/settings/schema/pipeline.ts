import { z } from 'zod';

const PIPELINE_FORM_BASE_SCHEMA = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const CREATE_PIPELINE_FORM_SCHEMA = PIPELINE_FORM_BASE_SCHEMA.extend({
  channelId: z.string(),
});

export const UPDATE_PIPELINE_FORM_SCHEMA = PIPELINE_FORM_BASE_SCHEMA.extend({
  _id: z.string(),
});

export const UPDATE_PIPELINE_PERMISSIONS_FORM_SCHEMA = z.object({
  dayAfterCreated: z.boolean(),
  branchOnly: z.boolean(),
  myTicketsOnly: z.boolean(),
  departmentOnly: z.boolean(),
  allowAllUsers: z.boolean(),
  selectedUsers: z.array(z.string()),
  visibility: z.enum(['public', 'private']),
  memberIds: z.array(z.string()),
});
