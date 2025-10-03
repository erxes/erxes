import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// import { PASSWORD_REGEX } from 'erxes-ui';

export const authValidationSchema = z
  .object({
    email: z.string().max(320).min(1, 'Email or username is required'),
    password: z.string().min(1, 'Password is required'),
  })
  .required();

export type FormType = z.infer<typeof authValidationSchema>;

export const useSignInUpForm = () => {
  const form = useForm<FormType>({
    resolver: zodResolver(authValidationSchema),
  });

  return { form };
};

export const resedPasswordValidationSchema = z
  .object({
    password: authValidationSchema.shape.password,
    confirmPassword: authValidationSchema.shape.password,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormType = z.infer<
  typeof resedPasswordValidationSchema
>;

export const useResetPasswordForm = () => {
  const form = useForm<ResetPasswordFormType>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(resedPasswordValidationSchema),
  });
  return { form };
};
