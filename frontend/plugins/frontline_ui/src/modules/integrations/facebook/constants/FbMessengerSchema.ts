import { z } from 'zod';

export const FACEBOOK_INTEGRATION_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  brandId: z.string().min(1, 'Brand is required'),
});
