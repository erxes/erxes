import { z } from 'zod';
import { CtaxKind, CtaxStatus } from '../types/CtaxRow';

export const ctaxFormSchema = z.object({
  number: z.string().min(1),
  name: z.string().min(1),
  kind: z.nativeEnum(CtaxKind),
  percent: z.number().min(0).max(100),
  status: z.nativeEnum(CtaxStatus),
});
