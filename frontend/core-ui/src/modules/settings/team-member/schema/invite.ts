import { TFunction } from 'i18next';
import { z } from 'zod';

export const getInviteFormSchema = (t: TFunction) =>
  z.object({
    emails: z
      .array(z.string().email(t('invalid-email')))
      .min(1, t('add-at-least-one-email')),
    entityId: z.string().optional(),
    seatIds: z.array(z.string()),
  });

export type TInviteForm = z.infer<ReturnType<typeof getInviteFormSchema>>;
