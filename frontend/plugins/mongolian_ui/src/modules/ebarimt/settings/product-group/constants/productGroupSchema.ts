import { z } from 'zod';
import { ProductGroupStatus } from '@/ebarimt/settings/product-group/constants/productGroupDefaultValues';

export const productGroupSchema = z
  .object({
    mainProductId: z.string().min(1, 'Main product is required'),
    subProductId: z.string().min(1, 'Sub product is required'),
    sortNum: z.number().min(0, 'Sort number must be at least 0'),
    ratio: z.number().min(0, 'Ratio must be at least 0'),
    isActive: z.boolean().default(true),
    status: z.nativeEnum(ProductGroupStatus).default(ProductGroupStatus.ACTIVE),
  })
  .refine((data) => data.mainProductId !== data.subProductId, {
    message: 'Main product and sub product must be different',
    path: ['subProductId'],
  });

export type TProductGroupForm = z.infer<typeof productGroupSchema>;
