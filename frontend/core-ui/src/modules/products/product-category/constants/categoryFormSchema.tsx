import { z } from 'zod';

export const CATEGORY_FORM_SCHEMA = z.object({
  name: z.string().min(1),
});
