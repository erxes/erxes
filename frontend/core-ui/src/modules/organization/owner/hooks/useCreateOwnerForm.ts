import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PASSWORD_REGEX } from 'erxes-ui';

export const PURPOSE_OPTIONS = [
  {
    value: 'manage a personal project',
    labelKey: 'purpose-personal-project',
  },
  {
    value: 'manage an internal company use case',
    labelKey: 'purpose-internal-company',
  },
  {
    value: 'attract new businesses',
    labelKey: 'purpose-attract-businesses',
  },
];

export const ownerValidationSchema = z
  .object({
    email: z.string().trim().email('Email must be a valid email'),
    password: z
      .string()
      .regex(
        PASSWORD_REGEX,
        'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters',
      ),
    confirmPassword: z
      .string()
      .regex(
        PASSWORD_REGEX,
        'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters',
      ),
    firstName: z.string().trim(),
    lastName: z.string().trim(),
    purpose: z.string(),
    subscribeEmail: z.boolean(),
  })
  .required()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type CreateOwnerFormType = z.infer<typeof ownerValidationSchema>;

export const useCreateOwnerForm = () => {
  const form = useForm<CreateOwnerFormType>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      purpose: '',
      subscribeEmail: false,
    },
    resolver: zodResolver(ownerValidationSchema),
  });

  return { form };
};
