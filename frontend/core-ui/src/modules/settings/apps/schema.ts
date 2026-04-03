import { z } from 'zod';

export const APPS_FORM_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
});
