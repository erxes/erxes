import { z } from 'zod';
import { safeRemainderEditSchema, safeRemainderSchema } from './safeRemainderSchema';

export type TSafeRemainderForm = z.infer<typeof safeRemainderSchema>;
export type TSafeRemainderEditForm = z.infer<typeof safeRemainderEditSchema>;
