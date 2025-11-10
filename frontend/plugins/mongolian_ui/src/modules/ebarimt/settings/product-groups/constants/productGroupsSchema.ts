import { z } from 'zod';
import {
  ProductCategory,
  ProductGroupStatus,
} from './productGroupsDefaultValues';

export const productGroupsSchema = z.object({
  mainProducts: z.nativeEnum(ProductCategory),
  subProducts: z.nativeEnum(ProductCategory),
  sortNumber: z.number().min(0, 'Must be 0 or greater'),
  ratio: z.number().min(0).max(100, 'Must be between 0 and 100'),
  isActive: z.boolean().default(true),
  status: z.nativeEnum(ProductGroupStatus).default(ProductGroupStatus.ACTIVE),
});

export type TProductGroupsForm = z.infer<typeof productGroupsSchema>;
