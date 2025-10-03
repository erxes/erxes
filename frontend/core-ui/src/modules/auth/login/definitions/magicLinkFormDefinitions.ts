import { z } from 'zod';

export const magicLinkFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export type MagicLinkFormType = z.infer<typeof magicLinkFormSchema>;
