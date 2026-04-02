import { z } from 'zod';
import { CustomFieldValue } from '../posts/CustomFieldInput';

export const pageFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  path: z.string().min(1, 'Path is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  clientPortalId: z.string().min(1, 'Client portal ID is required'),
  thumbnail: z.object({
    url: z.string(),
    name: z.string(),
    type: z.string().optional(),
  }).nullable().optional(),
  gallery: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  documents: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  customFieldsData: z.array(z.object({
    field: z.string(),
    value: z.custom<CustomFieldValue>(),
  })).optional(),
});

export type PageFormType = z.infer<typeof pageFormSchema>;
