import { z } from 'zod';
import { safeRemainderSchema } from './safeRemainderSchema';

export type TSafeRemainderForm = z.infer<typeof safeRemainderSchema>;
