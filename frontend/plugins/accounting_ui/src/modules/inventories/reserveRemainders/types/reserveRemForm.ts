import { getI18n } from 'react-i18next';
import { z } from 'zod';

export const reserveRemSchema = z
  .object({
    branchIds: z.array(z.string()).optional(),
    departmentIds: z.array(z.string()).optional(),
    productCategoryId: z.string().optional(),
    productId: z.string().optional(),
    remainder: z.number({ invalid_type_error: 'Remainder is required' }),
  })
  .refine(
    (data) => !!data.productCategoryId || !!data.productId,
    () => ({
      message: getI18n().t('Must fill product category or product', {
        ns: 'accounting',
        nsSeparator: false,
      }),
      path: ['productCategoryId'],
    }),
  );

export type TReserveRemForm = z.infer<typeof reserveRemSchema>;
