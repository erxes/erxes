import { z } from 'zod';

export const TAGS_FORM_SCHEMA = z.object({
  name: z.string(),
  type: z.string(),
  colorCode: z.string().optional(),
  parentId: z.string().optional(),
});
