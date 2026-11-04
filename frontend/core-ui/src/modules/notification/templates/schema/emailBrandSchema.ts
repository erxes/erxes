import { TFunction } from 'i18next';
import { z } from 'zod';

export const getEmailBrandSchema = (t: TFunction) =>
  z.object({
    name: z.string().trim().max(100, t('brand-name-too-long')),
    logoUrl: z
      .string()
      .trim()
      .refine((value) => !value || /^https?:\/\//i.test(value), {
        message: t('brand-logo-invalid'),
      }),
    color: z
      .string()
      .trim()
      .regex(/^#[0-9a-f]{6}$/i, t('brand-color-invalid')),
    footerText: z.string().trim().max(500, t('brand-footer-too-long')),
  });

export type TEmailBrandForm = z.infer<ReturnType<typeof getEmailBrandSchema>>;
