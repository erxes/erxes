import { z } from 'zod';
import { reCalcRemainderSchema } from './reCalcRemainderSchema';

export type TReCalcRemainderForm = z.infer<typeof reCalcRemainderSchema>;
