import { z } from 'zod';

export const USERS_GROUP_FORM_SCHEAMA = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});
