import { z } from 'zod';

export const PIPELINE_FORM_SCHEMA = z.object({
    name: z.string(),
    description: z.string().optional(),
    // userId: z.string().optional(),
});
