import { z } from 'zod';

export const FACEBOOK_INTEGRATION_SCHEMA = z.object({
  name: z.string().min(1),
  brandId: z.string().min(1),
  channelIds: z.array(z.string().min(1)).optional(),
});
