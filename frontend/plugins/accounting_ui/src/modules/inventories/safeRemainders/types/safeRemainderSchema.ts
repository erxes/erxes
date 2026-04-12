import { z } from 'zod';

export const safeRemainderSchema = z.object({
  date: z.date(),
  description: z.string(),

  branchId: z.string(),
  departmentId: z.string(),
  productCategoryId: z.string().optional(),
});

export const safeRemainderEditSchema = z.object({
  incomeRule: z
    .object({
      accountId: z.string(),
      customerType: z.string().optional(),
      customerId: z.string().optional(),
    })
    .catchall(z.any()),
  outRule: z
    .object({
      accountId: z.string(),
      customerType: z.string().optional(),
      customerId: z.string().optional(),
    })
    .catchall(z.any()),
  saleRule: z
    .object({
      accountId: z.string(),
      customerType: z.string().optional(),
      customerId: z.string().optional(),
    })
    .catchall(z.any()),
});
