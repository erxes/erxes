import { z } from 'zod';

export const OAUTH_CLIENTS_FORM_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  logo: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['public', 'confidential']),
  redirectUrls: z.array(z.string().trim()).default([]),
});
