import { z } from 'zod';

export const websiteFormSchema = z.object({
  name: z.string().min(1, 'CMS Name is required'),
  description: z.string().min(1, 'Description is required'),
  domain: z.string().default(''),
  url: z.string().default(''),
  kind: z.string().min(1, 'Client Portal is required'),
  languages: z.array(z.string()).default([]),
  language: z.string().default(''),
  postUrlField: z.enum(['_id', 'count', 'slug']).default('_id'),
});

export type WebsiteFormType = z.infer<typeof websiteFormSchema>;
