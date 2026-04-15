import { CurrencyCode } from 'erxes-ui';
import { z } from 'zod';
import {
  AccountKind,
  AccountStatus,
  JournalEnum,
  BankEnum,
} from '../types/Account';
const extraSchema = z
  .object({
    bank: z.nativeEnum(BankEnum).optional(),
    bankAccount: z.string().min(1).optional(),
  })
  .optional();

export const accountSchema = z
  .object({
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
    status: z.nativeEnum(AccountStatus).optional(),
    extra: extraSchema,
  })
  .superRefine((data, ctx) => {
    if (data.journal === JournalEnum.BANK) {
      if (!data.extra?.bank) {
        ctx.addIssue({
          path: ['extra', 'bank'],
          message: 'Bank is required for bank journal',
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.extra?.bankAccount) {
        ctx.addIssue({
          path: ['extra', 'bankAccount'],
          message: 'Bank account is required for bank journal',
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
