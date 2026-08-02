import { z } from 'zod';

export const sendEmailConfigFormSchema = z.object({
  /**
   * What recipients see beside the address. Required because where the `From`
   * is rewritten to the platform address, the name is all that identifies the
   * sender.
   */
  sender: z.string().min(1, 'Sender name is required'),
  fromEmailPlaceHolder: z.string(),
  replyToEmail: z.string().optional(),
  toEmailsPlaceHolders: z.string(),
  ccEmailsPlaceHolders: z.string(),
  subject: z.string(),
  content: z.string(),
  html: z.string(),
  type: z.enum(['default', 'verified', 'custom']),
});

export type TAutomationSendEmailConfig = z.infer<
  typeof sendEmailConfigFormSchema
>;
