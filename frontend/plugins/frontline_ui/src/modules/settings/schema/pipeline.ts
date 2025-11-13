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

