import { z } from 'zod';
import { isRecord } from '@/shared/utils/isRecord';

const INSTAGRAM_REPLY_DELIVERY_SCHEMA = z.object({
  status: z.enum(['sent', 'partial']),
  textSent: z.boolean(),
  sentAttachmentUrls: z.array(z.string()),
  error: z.string().optional(),
});

export const readInstagramDelivery = (extraData: unknown) => {
  if (!isRecord(extraData)) return undefined;
  const result = INSTAGRAM_REPLY_DELIVERY_SCHEMA.safeParse(
    extraData.instagramDelivery,
  );
  return result.success ? result.data : undefined;
};
