import { z } from 'zod';

export const safeRemainderSchema = z.object({
  date: z.date(),
  description: z.string(),

  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  productCategoryId: z.string().optional(),
});

export const safeRemainderEditSchema = z.object({
  incomeRule: z
    .object({
      accountId: z.string(),
      customerType: z.string().optional(),
      customerId: z.string().optional(),
    })
    .catchall(z.unknown()),
  outRule: z
    .object({
      accountId: z.string(),
      customerType: z.string().optional(),
      customerId: z.string().optional(),
    })
    .catchall(z.unknown()),
  saleRule: z
    .object({
      accountId: z.string().min(1),
      outAccountId: z.string().min(1),
      costAccountId: z.string().min(1),
      customerType: z.string().optional(),
      customerId: z.string().optional(),
    })
    .catchall(z.unknown()),
  costIncreaseRule: z.object({
    accountId: z.string().min(1),
  }),
  costDecreaseRule: z.object({
    accountId: z.string().min(1),
  }),
});
