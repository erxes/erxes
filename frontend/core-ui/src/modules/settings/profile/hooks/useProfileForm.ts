import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const discordIdRegex = /^\d{17,19}$/;
const discordUrlRegex = new RegExp(
  '^https://(?:www\\.)?discord\\.com/users/[A-Za-z0-9-]+/?$|' +
    '^https://(?:www\\.)?discord\\.gg/[A-Za-z0-9-]+/?$',
);

export const profileValidationSchema = z
  .object({
    details: z.object({
      avatar: z.string().optional().nullable(),
      firstName: z.string(),
      lastName: z.string(),
      middleName: z.string().optional().nullable(),
      shortName: z.string().optional(),
      operatorPhone: z.string().optional(),
      birthDate: z.date().or(z.string()).optional(),
      workStartedDate: z.date().or(z.string()).optional(),
      location: z.string().optional(),
      employeeId: z.string().optional().nullable(),
    }),
    links: z
      .object({
        facebook: z
          .string()
          .url()
          .regex(
            /^https:\/\/(www\.)?facebook\.com\/((profile\.php\?id=\d+)|([A-Za-z0-9._-]+))\/?$/,
            {
              message: 'Invalid Facebook URL',
            },
          )
          .optional()
          .or(z.literal('')),
        twitter: z
          .string()
          .url()
          .regex(
            /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9._-]+\/?$/,
            {
              message: 'Invalid Twitter/X URL',
            },
          )
          .optional()
          .or(z.literal('')),
        website: z
          .string()
          .url({ message: 'Invalid website URL' })
          .optional()
          .or(z.literal('')),

        discord: z
          .string()
          .refine(
            (val) =>
              val === '' ||
              discordIdRegex.test(val) ||
              discordUrlRegex.test(val),
            {
              message: 'Enter a valid Discord profile URL or User ID',
            },
          )
          .optional(),
        gitHub: z
          .string()
          .url()
          .regex(/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9._-]+\/?$/, {
            message: 'Invalid GitHub URL',
          })
          .optional()
          .or(z.literal('')),
        instagram: z
          .string()
          .url()
          .regex(/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?$/, {
            message: 'Invalid Instagram URL',
          })
          .optional()
          .or(z.literal('')),
      })
      .optional(),
    username: z.string(),
    email: z.string().trim().email('Email must be a valid email'),
    positionIds: z.array(z.string()).optional(),
  })
  .required();

export type FormType = z.infer<typeof profileValidationSchema>;
const useProfileForm = () => {
  const form = useForm<FormType>({
    mode: 'onBlur',
    defaultValues: {
      details: {
        avatar: '',
        firstName: '',
        lastName: '',
        shortName: '',
        middleName: '',
        operatorPhone: '',
        birthDate: undefined,
        workStartedDate: undefined,
        location: '',
        employeeId: '',
      },
      links: {
        facebook: '',
        twitter: '',
        website: '',
        discord: '',
        gitHub: '',
        instagram: '',
      },
      username: '',
      email: '',
      positionIds: [],
    },
    resolver: zodResolver(profileValidationSchema),
  });

  return { form };
};

export { useProfileForm };
