import { z } from 'zod';

export const createFormLinkActionFormSchema = z.object({
  formId: z.string().min(1, { message: 'Select a form' }),
  expiresInDays: z
    .string()
    .optional()
    .refine((value) => !value || (Number(value) > 0 && Number(value) <= 365), {
      message: 'Enter between 1 and 365 days',
    }),
});

export type TCreateFormLinkActionForm = z.infer<
  typeof createFormLinkActionFormSchema
>;
