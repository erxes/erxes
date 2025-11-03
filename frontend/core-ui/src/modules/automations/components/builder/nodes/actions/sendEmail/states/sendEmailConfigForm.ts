import { z } from 'zod';

export const sendEmailConfigFormSchema = z.object({
  fromUserId: z.string(),
  fromEmailPlaceHolder: z.string(),
  toEmailsPlaceHolders: z.string(),
  ccEmailsPlaceHolders: z.string(),
  customMails: z.array(z.string()),
  attributionMails: z.string(),
  teamMember: z.array(z.string()),
  customer: z.array(z.string()),
  subject: z.string(),
  emailTemplateId: z.string(),
  content: z.string(),
  html: z.string(),
  type: z.enum(['default', 'custom']),
});

export type TAutomationSendEmailConfig = z.infer<
  typeof sendEmailConfigFormSchema
>;
