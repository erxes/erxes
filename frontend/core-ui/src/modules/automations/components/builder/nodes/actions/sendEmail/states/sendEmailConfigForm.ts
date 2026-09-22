import { z } from 'zod';

export const sendEmailConfigFormSchema = z.object({
  sender: z.string().min(1, 'Sender name is required'),
  fromEmailPlaceHolder: z.string(),
  replyToEmail: z.string().optional(),
  toEmailsPlaceHolders: z.string(),
  ccEmailsPlaceHolders: z.string(),
  subject: z.string(),
  content: z.string(),
  // What the body was written in. Absent on every action saved before the
  // email editor, and that absence means block content.
  contentJson: z.any().optional(),
  contentFormat: z.enum(['blocks', 'maily']).optional(),
  html: z.string(),
  type: z.enum(['default', 'verified', 'custom']),
});

export type TAutomationSendEmailConfig = z.infer<
  typeof sendEmailConfigFormSchema
>;
