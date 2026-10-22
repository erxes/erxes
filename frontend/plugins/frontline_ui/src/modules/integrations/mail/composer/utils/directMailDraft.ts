import type { IBlockEditor } from 'erxes-ui';
import { z } from 'zod';

export const directMailDraftSchema = z.object({
  target: z.object({
    email: z.string().optional(),
    customerId: z.string().optional(),
    companyId: z.string().optional(),
    integrationId: z.string().optional(),
  }),
  values: z.object({
    integrationId: z.string(),
    to: z.string(),
    cc: z.string(),
    bcc: z.string(),
    subject: z.string(),
    body: z.string(),
  }),
  recipientCustomerId: z.string().optional(),
  showCc: z.boolean(),
  showBcc: z.boolean(),
  attachments: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      name: z.string().optional(),
      type: z.string().optional(),
      size: z.number().optional(),
      contentId: z.string().optional(),
      disposition: z.enum(['inline', 'attachment']).optional(),
    }),
  ),
});

export const draftBlocksSchema = z.custom<IBlockEditor['document']>(
  (value: unknown) =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (block: unknown) =>
        typeof block === 'object' &&
        block !== null &&
        'type' in block &&
        typeof block.type === 'string' &&
        'id' in block &&
        typeof block.id === 'string',
    ),
);
