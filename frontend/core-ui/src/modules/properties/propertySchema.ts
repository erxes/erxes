import { z } from 'zod';

export const propertyGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().min(1, 'Description is required'),
  code: z.string().optional(),
});

export const propertySchema = z.object({
  icon: z.string().optional(),
  name: z.string().min(1, 'Property name is required'),
  description: z.string().optional(),
  code: z.string().optional(),
  groupId: z.string(),
  type: z.string().min(1, 'Type is required'),
  validation: z.string().optional(),
  isSearchable: z.boolean().default(false),
  options: z
    .array(
      z.object({
        label: z.string().min(1, 'Label is required'),
        value: z.string().min(1, 'Value is required'),
      }),
    )
    .optional(),
});
