import { z } from 'zod';

export const INSTAGRAM_INTEGRATION_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
});
