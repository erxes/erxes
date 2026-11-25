import { z } from 'zod';

export const taxCustomerConfigSchema = z
  .object({
    customerType: z.enum(['customer', 'company', 'user']),
    customerId: z.string().trim().min(1),
  })
  .nullish();

export type TaxCustomerConfig = NonNullable<
  z.infer<typeof taxCustomerConfigSchema>
>;

export const validateTaxCustomerConfig = (code: string, value: unknown) => {
  if (code !== 'VatCustomer' && code !== 'CtaxCustomer') {
    return;
  }

  if (!taxCustomerConfigSchema.safeParse(value).success) {
    throw new Error(
      `${code} requires a customerType (customer, company, or user) and a customerId`,
    );
  }
};
