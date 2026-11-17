import { z } from 'zod';
import { PACKAGE_STATUSES } from '../types/Package';

// What `productPackagesAdd` requires of a new package.
export const PACKAGE_FORM_SCHEMA = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  products: z
    .array(z.object({ productId: z.string(), quantity: z.number().min(1) }))
    .min(1, 'At least one product is required'),
  tagIds: z.array(z.string()).optional(),
  price: z
    .number()
    .min(0, 'Price must be a non-negative number')
    .nullable()
    .optional(),
  percent: z.number().min(0).max(100).nullable().optional(),
  status: z.enum(PACKAGE_STATUSES).default('active'),
});

export type TPackageFormValues = z.infer<typeof PACKAGE_FORM_SCHEMA>;
