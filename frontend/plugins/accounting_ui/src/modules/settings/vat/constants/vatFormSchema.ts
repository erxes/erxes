import { z } from 'zod';
import { VatKind, VatStatus } from '../types/VatRow';

export const vatFormSchema = z.object({
  number: z.string().min(1),
  name: z.string().min(1),
  kind: z.nativeEnum(VatKind),
  percent: z.number().min(0).max(100),
  tabCount: z.number().min(0),
  isBold: z.boolean(),
  status: z.nativeEnum(VatStatus),
});
