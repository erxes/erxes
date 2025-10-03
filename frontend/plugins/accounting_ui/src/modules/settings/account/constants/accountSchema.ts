import { CurrencyCode } from 'erxes-ui';
import { z } from 'zod';
import { AccountKind, JournalEnum } from '../types/Account';

export const accountSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  categoryId: z.string().min(1),
  description: z.string().optional(),
  currency: z.nativeEnum(CurrencyCode),
  kind: z.nativeEnum(AccountKind),
  journal: z.nativeEnum(JournalEnum),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  isTemp: z.boolean(),
  isOutBalance: z.boolean(),
});
