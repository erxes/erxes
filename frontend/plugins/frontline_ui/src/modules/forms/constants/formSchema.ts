import { IAttachment } from 'erxes-ui';
import { z } from 'zod';

export const FORM_GENERAL_SCHEMA = z.object({
  primaryColor: z.string(),
  appearance: z.string(),
  title: z.string(),
  description: z.string(),
  buttonText: z.string(),
});

export const FORM_CONFIRMATION_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
  image: z.custom<IAttachment>().nullable(),
});

export const FORM_CONTENT_SCHEMA = z.object({
  steps: z.record(
    z.string(),
    z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      order: z.number(),
      fields: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          label: z.string(),
          description: z.string(),
          placeholder: z.string().optional(),
          options: z.array(z.string()),
          span: z.number().optional().default(1),
          required: z.boolean().optional().default(false),
          order: z.number().optional().default(0),
          stepId: z.string(),
          validation: z.string().optional().default('').nullable(),
        }),
      ),
    }),
  ),
});
