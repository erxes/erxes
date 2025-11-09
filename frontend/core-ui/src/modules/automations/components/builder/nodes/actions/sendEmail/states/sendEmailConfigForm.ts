import { z } from 'zod';

export const sendEmailConfigFormSchema = z.object({
  fromEmailPlaceHolder: z.string(),
  toEmailsPlaceHolders: z.string(),
  ccEmailsPlaceHolders: z.string(),
  subject: z.string(),
  content: z.string(),
  html: z.string(),
  type: z.enum(['default', 'custom']),
});

export type TAutomationSendEmailConfig = z.infer<
  typeof sendEmailConfigFormSchema
>;
