import { z } from 'zod';

export const splitAddresses = (value: string): string[] =>
  value
    .split(/[,;]+/)
    .map((address) => address.trim())
    .filter(Boolean);

const optionalRecipients = z
  .string()
  .refine(
    (value) =>
      splitAddresses(value).every(
        (address) => z.string().email().safeParse(address).success,
      ),
    'Enter valid email addresses separated by commas',
  );

export const composeSchema = z.object({
  integrationId: z.string().min(1, 'Choose a sender'),
  to: z.string().trim().email('Enter a valid recipient email'),
  cc: optionalRecipients,
  bcc: optionalRecipients,
  subject: z.string().trim().min(1, 'Subject is required'),
  body: z.string().trim().min(1, 'Message is required'),
});

export const toHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('\n', '<br/>');
