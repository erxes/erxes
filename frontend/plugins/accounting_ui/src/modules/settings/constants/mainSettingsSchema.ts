import { z } from 'zod';
import { CustomerType } from 'ui-modules';

const taxCustomerFormSchema = z
  .object({
    customerType: z.nativeEnum(CustomerType),
    customerId: z.string().trim(),
  })
  .nullish();

export const mainSettingsSchema = z.object({
  MainCurrency: z.string().min(1),
  HasVat: z.boolean(),
  VatPayableAccount: z.string().optional(),
  VatReceivableAccount: z.string().optional(),
  VatAfterPayableAccount: z.string().optional(),
  VatAfterReceivableAccount: z.string().optional(),
  VatCustomer: taxCustomerFormSchema,
  HasCtax: z.boolean(),
  CtaxPayableAccount: z.string().optional(),
  CtaxCustomer: taxCustomerFormSchema,
  dominantReadAccountUsers: z.array(z.string()).optional(),
  dominantWriteAccountUsers: z.array(z.string()).optional(),
});

export type TMainSettings = z.infer<typeof mainSettingsSchema>;
