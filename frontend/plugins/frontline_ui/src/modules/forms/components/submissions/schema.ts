import { z } from 'zod';

export const SUBMISSION_DETAILS_SCHEMA = z.record(z.string(), z.any());

export type SubmissionDetailsFormValues = z.infer<typeof SUBMISSION_DETAILS_SCHEMA>;
