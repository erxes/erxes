import { z } from 'zod';
import { adjustClosingSchema } from './adjustClosingSchema';

export type TAdjustClosingForm = z.infer<typeof adjustClosingSchema>;
