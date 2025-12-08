import { z } from 'zod';

export const createCustomerSchema = z
  .object({
    type: z.enum(['email', 'phone']),
    customerId: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'email') {
      if (!data.email) {
        ctx.addIssue({
          path: ['email'],
          code: z.ZodIssueCode.custom,
          message: 'Email is required',
        });
      } else if (!z.string().email().safeParse(data.email).success) {
        ctx.addIssue({
          path: ['email'],
          code: z.ZodIssueCode.custom,
          message: 'Email is invalid',
        });
      }
    }
    if (data.type === 'phone') {
      if (!data.phone) {
        ctx.addIssue({
          path: ['phone'],
          code: z.ZodIssueCode.custom,
          message: 'Phone is required',
        });
      }
    }
  });

export const TicketForgotProgressSchema = z.object({
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
});

export const TicketCheckProgressSchema = z.object({
  number: z.string().min(1, 'Ticket number is required'),
});
