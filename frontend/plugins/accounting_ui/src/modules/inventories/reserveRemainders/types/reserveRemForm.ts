import type { TFunction } from 'i18next';
import { z } from 'zod';

const getRemainderSchema = (t: TFunction<'accounting'>) =>
  z.number({
    required_error: t('Remainder is required'),
    invalid_type_error: t('Remainder is required'),
  });

export const getReserveRemSchema = (t: TFunction<'accounting'>) =>
  z
    .object({
      branchIds: z.array(z.string()).optional(),
      departmentIds: z.array(z.string()).optional(),
      productCategoryId: z.string().optional(),
      productId: z.string().optional(),
      remainder: getRemainderSchema(t),
    })
    .refine((data) => !!data.productCategoryId || !!data.productId, {
      message: t('Must fill product category or product', {
        nsSeparator: false,
      }),
      path: ['productCategoryId'],
    });

export const getReserveRemEditSchema = (t: TFunction<'accounting'>) =>
  z.object({
    productId: z.string().min(1, t('Must fill product')),
    branchId: z.string().optional(),
    departmentId: z.string().optional(),
    uom: z.string().optional(),
    remainder: getRemainderSchema(t),
  });

export type TReserveRemForm = z.infer<ReturnType<typeof getReserveRemSchema>>;
export type TReserveRemEditForm = z.infer<
  ReturnType<typeof getReserveRemEditSchema>
>;
