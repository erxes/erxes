import type { TFunction } from 'i18next';
import { z } from 'zod';

export const reserveRemSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      branchIds: z.array(z.string()).optional(),
      departmentIds: z.array(z.string()).optional(),
      productCategoryId: z.string().optional(),
      productId: z.string().optional(),
      remainder: z.number({
        errorMap: () => ({
          message: t('enter-the-reserved-quantity'),
        }),
      }),
    })
    .refine(
      (data) => !!data.productCategoryId || !!data.productId,
      () => ({
        message: t('select-a-product-category-or-product'),
        path: ['productCategoryId'],
      }),
    );

export type TReserveRemForm = z.infer<ReturnType<typeof reserveRemSchema>>;
