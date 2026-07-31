import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export const CHANGE_PASSWORD_SCHEMA = z

  .object({
    currentPassword: z
      .string({
        required_error: 'password-error',
      })
      .trim()
      .min(8, { message: 'password-error' }),
    newPassword: z
      .string()
      .refine((val) => /.{8,}/.test(val), { message: 'At least 8 characters' })
      .refine((val) => /[0-9]/.test(val), { message: 'At least 1 number' })
      .refine((val) => /[a-z]/.test(val), {
        message: 'At least 1 lowercase letter',
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: 'At least 1 uppercase letter',
      }),
    reTypeNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.reTypeNewPassword, {
    message: 'Passwords must match',
    path: ['reTypeNewPassword'],
  });
