import { z } from 'zod';

export const PIPELINE_CREATE_SCHEMA = z.object({
  title: z.string(),
});
