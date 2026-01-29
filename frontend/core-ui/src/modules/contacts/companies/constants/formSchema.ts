import { z } from 'zod';

export const companyFormSchema = z.object({
  primaryName: z.string().min(1, 'Name is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  ownerId: z.string().optional(),
  phone: z.string().optional(),
  industry: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  businessType: z.string().optional(),
  size: z.coerce.number().optional(),
  description: z.string().optional(),
  plan: z.string().optional(),
  code: z.string().optional(),
  avatar: z.string().optional(),
  location: z.string().optional(),
  parentCompanyId: z.string().optional(),
});

export type CompanyFormType = z.infer<typeof companyFormSchema>;
