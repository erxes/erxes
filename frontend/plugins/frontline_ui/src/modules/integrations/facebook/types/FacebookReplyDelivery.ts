import { z } from 'zod';
import { isRecord } from '@/shared/utils/isRecord';

const FACEBOOK_REPLY_DELIVERY_SCHEMA = z.object({
  status: z.enum(['sent', 'partial']),
  textSent: z.boolean(),
  sentAttachmentUrls: z.array(z.string()),
  error: z.string().optional(),
});

export type FacebookReplyDelivery = z.output<
  typeof FACEBOOK_REPLY_DELIVERY_SCHEMA
>;

/** `conversationMessageAdd.extraData` is JSON; Facebook replies report delivery there. */
export const readFacebookDelivery = (
  extraData: unknown,
): FacebookReplyDelivery | undefined => {
  if (!isRecord(extraData)) {
    return undefined;
  }

  const parsed = FACEBOOK_REPLY_DELIVERY_SCHEMA.safeParse(
    extraData.facebookDelivery,
  );

  return parsed.success ? parsed.data : undefined;
};
