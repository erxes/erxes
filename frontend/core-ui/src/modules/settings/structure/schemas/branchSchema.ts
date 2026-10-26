import { z } from 'zod';

export const SOCIAL_LINKS = z.object({
  facebook: z
    .string()
    .url()
    .regex(/^https:\/\/(www\.)?facebook\.com\/[A-Za-z0-9._-]+$/, {
      message: 'Invalid Facebook URL',
    })
    .optional()
    .nullable()
    .or(z.literal('')),
  twitter: z
    .string()
    .url()
    .regex(/^https:\/\/(www\.)?twitter\.com\/[A-Za-z0-9._-]+$/, {
      message: 'Invalid Twitter URL',
    })
    .optional()
    .nullable()
    .or(z.literal('')),
  website: z
    .string()
    .url({ message: 'Invalid website URL' })
    .optional()
    .nullable()
    .or(z.literal('')),
  youtube: z
    .string()
    .url()
    .regex(
      /^https:\/\/(www\.)?youtube\.com\/@?[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*\/?(?:\?[^#]*)?(?:#.*)?$/,
      {
        message: 'Invalid Youtube URL',
      },
    )
    .optional()
    .nullable()
    .or(z.literal('')),
  whatsapp: z
    .string()
    .url()
    .regex(/^https:\/\/(www\.)?whatsapp\.com\/[A-Za-z0-9._-]+$/, {
      message: 'Invalid whatsapp URL',
    })
    .optional()
    .nullable()
    .or(z.literal('')),
});

const coordinateValue = (limit: number, message: string) =>
  z
    .string()
    .optional()
    .nullable()
    .refine(
      (value) =>
        !value ||
        (Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit),
      { message },
    );

export const BRANCH_CREATE_SCHEMA = z.object({
  title: z.string(),
  address: z.string().optional().nullable().or(z.literal('')),
  code: z.string().min(1, { message: 'Code is required' }),
  supervisorId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  userIds: z.string().array().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  coordinate: z
    .object({
      latitude: coordinateValue(90, 'Latitude must be between -90 and 90'),
      longitude: coordinateValue(180, 'Longitude must be between -180 and 180'),
    })
    .optional()
    .nullable(),
  links: SOCIAL_LINKS.optional().nullable(),
  radius: z.number().optional().nullable(),
  status: z.string().optional().nullable(),
});
