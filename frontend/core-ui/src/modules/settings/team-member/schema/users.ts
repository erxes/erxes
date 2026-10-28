import { z } from 'zod';

const USER_RESET_PASSWORD_SCHEMA = z
  .object({
    newPassword: z
      .string()
      .refine((val) => /.{8,}/.test(val), {
        message: 'At least 8 characters',
      })
      .refine((val) => /[0-9]/.test(val), { message: 'At least 1 number' })
      .refine((val) => /[a-z]/.test(val), {
        message: 'At least 1 lowercase letter',
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: 'At least 1 uppercase letter',
      }),
    repeatPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    message: 'Passwords must match',
    path: ['repeatPassword'],
  });

export { USER_RESET_PASSWORD_SCHEMA };
