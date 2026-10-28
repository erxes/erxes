import { TFunction } from 'i18next';
import { z } from 'zod';

export const getMembershipFormSchema = (t: TFunction) =>
  z
    .object({
      entityId: z.string().min(1, t('choose-node')),
      isPrimary: z.boolean(),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
    })
    .superRefine(({ startsAt, endsAt }, ctx) => {
      if (endsAt && endsAt <= (startsAt ?? new Date())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endsAt'],
          message: t('end-before-start'),
        });
      }
    });

export type TMembershipForm = z.infer<
  ReturnType<typeof getMembershipFormSchema>
>;
