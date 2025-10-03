import { z } from 'zod';

export const SOCIAL_LINKS = z.object({
  facebook: z
    .string()
    .url()
    .regex(/^https:\/\/(www\.)?facebook\.com\/[A-Za-z0-9._-]+$/, {
      message: 'Invalid Facebook URL',
    })
    .optional()
    .or(z.literal('')),
  twitter: z
    .string()
    .url()
    .regex(/^https:\/\/(www\.)?twitter\.com\/[A-Za-z0-9._-]+$/, {
      message: 'Invalid Twitter URL',
    })
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url({ message: 'Invalid website URL' })
    .optional()
    .or(z.literal('')),
  youtube: z
    .string()
    .url()
    .regex(/^https:\/\/(www\.)?youtube\.com\/[A-Za-z0-9._-]+$/, {
      message: 'Invalid Youtube URL',
    })
    .optional()
    .or(z.literal('')),
  whatsapp: z
    .string()
    .url()
    .regex(/^https:\/\/(www\.)?whatsapp\.com\/[A-Za-z0-9._-]+$/, {
      message: 'Invalid whatsapp URL',
    })
    .optional()
    .or(z.literal('')),
});

export const BRANCH_CREATE_SCHEMA = z.object({
  title: z.string(),
  address: z.string(),
  code: z.string(),
  supervisorId: z.string().optional(),
  parentId: z.string().optional().nullable(),
  userIds: z.string().array().optional(),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  coordinate: z
    .object({
      latitude: z.string().optional(),
      longitude: z.string().optional(),
    })
    .optional(),
  links: SOCIAL_LINKS.optional(),
  image: z
    .object({
      name: z.string(),
      type: z.string(),
      url: z.string(),
    })
    .optional()
    .nullable(),
  radius: z.number().optional().nullable(),
});
