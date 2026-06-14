import { z } from 'zod';

export const TRANSFORM_VALUE_TYPES = [
  'text',
  'number',
  'boolean',
  'object',
  'array',
] as const;

export const transformConfigFormSchema = z.object({
  mappings: z
    .array(
      z.object({
        key: z.string().min(1, 'Output key is required'),
        value: z.any().optional(),
        type: z.enum(TRANSFORM_VALUE_TYPES).default('text'),
        isExpression: z.boolean().default(false),
      }),
    )
    .min(1, 'At least one mapping is required'),
});

export type TTransformValueType = (typeof TRANSFORM_VALUE_TYPES)[number];

export type TTransformConfigForm = z.infer<typeof transformConfigFormSchema>;
