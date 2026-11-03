import { TFunction } from 'i18next';
import { z } from 'zod';

export const getTemplateFormSchema = (t: TFunction) =>
  z.object({
    subject: z
      .string()
      .trim()
      .min(1, t('subject-required'))
      .max(200, t('subject-too-long')),
    preheader: z.string().trim().max(150, t('preheader-too-long')),
  });

export type TTemplateForm = z.infer<ReturnType<typeof getTemplateFormSchema>>;
