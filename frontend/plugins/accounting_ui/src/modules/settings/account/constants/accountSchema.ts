import { CurrencyCode } from 'erxes-ui';
import { z } from 'zod';
import {
  AccountKind,
  AccountStatus,
  JournalEnum,
} from '../types/Account';
import { undefed } from '~/modules/types/utils';

export const accountSchema = z
  .object({
    name: z.string().min(1),
    code: z.string().min(1),
    categoryId: z.string().min(1),
    description: undefed(z.string()),
    currency: z.nativeEnum(CurrencyCode),
    kind: z.nativeEnum(AccountKind),
    journal: z.nativeEnum(JournalEnum),
    branchId: undefed(z.string()),
    departmentId: undefed(z.string()),
    isTemp: z.boolean(),
    isOutBalance: z.boolean(),
    status: z.nativeEnum(AccountStatus).optional(),
    extra: z.object({
      bank: undefed(z.string()),
      bankAccount: undefed(z.string()),
    }).nullish(),
  })
  .superRefine((data, ctx) => {
    if (data.journal === JournalEnum.BANK) {
      if (!data.extra?.bank) {
        ctx.addIssue({
          path: ['extra', 'bank'],
          message: 'Банкны журналд банк заавал шаардлагатай',
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.extra?.bankAccount) {
        ctx.addIssue({
          path: ['extra', 'bankAccount'],
          message: 'Банкны журналд банкны данс заавал шаардлагатай',
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
