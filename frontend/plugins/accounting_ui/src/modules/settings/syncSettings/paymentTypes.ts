import { z } from 'zod';

const paymentTypeSchema = z.object({ type: z.string(), title: z.string() });

export const parsePaymentTypes = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    const result = paymentTypeSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
};
