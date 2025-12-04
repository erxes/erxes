import { z } from 'zod';

export const RESPONSE_FORM_BASE_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
});

export const CREATE_RESPONSE_FORM_SCHEMA = RESPONSE_FORM_BASE_SCHEMA.extend({
  channelId: z.string(),
});

export const UPDATE_RESPONSE_FORM_SCHEMA = RESPONSE_FORM_BASE_SCHEMA.extend({
  _id: z.string(),
});

export type TCreateResponseForm = z.infer<typeof CREATE_RESPONSE_FORM_SCHEMA>;
export type TUpdateResponseForm = z.infer<typeof UPDATE_RESPONSE_FORM_SCHEMA>;
