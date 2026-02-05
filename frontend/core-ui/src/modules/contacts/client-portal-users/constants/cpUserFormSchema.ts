import { z } from 'zod';

export const cpUserAddFormSchema = z
  .object({
    clientPortalId: z.string().min(1, 'Client portal is required'),
    email: z
      .string()
      .email('Invalid email format')
      .optional()
      .or(z.literal('')),
    phone: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    userType: z.enum(['customer', 'company']).optional(),
  })
  .refine(
    (data) =>
      (data.email ?? '').trim() !== '' || (data.phone ?? '').trim() !== '',
    {
      message: 'Email or phone is required',
      path: ['email'],
    },
  );

export type CPUserAddFormType = z.infer<typeof cpUserAddFormSchema>;

export const cpUserEditFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  companyName: z.string().optional(),
  companyRegistrationNumber: z.string().optional(),
});

export type CPUserEditFormType = z.infer<typeof cpUserEditFormSchema>;
