import type {
  FacebookReplyDelivery,
  FacebookReplyPart,
  FacebookReplyPartHandlers,
} from '@/integrations/facebook/@types/replyDelivery';
import { getErrorMessage } from '@/integrations/utils';

export const sendFacebookReplyParts = async (
  parts: FacebookReplyPart[],
  { send, persist }: FacebookReplyPartHandlers,
): Promise<FacebookReplyDelivery> => {
  if (!parts.length) throw new Error('Content or attachments are required');
  const delivery: FacebookReplyDelivery = {
    status: 'sent',
    textSent: false,
    sentAttachmentUrls: [],
  };
  let sentCount = 0;

  for (const part of parts) {
    try {
      const messageId = await send(part);
      if (!messageId) throw new Error('Facebook returned no message ID');
      // A provider acknowledgement means this part must never be retried,
      // even if saving the local record subsequently fails.
      sentCount += 1;
      delivery.textSent ||= Boolean(part.content);
      delivery.sentAttachmentUrls.push(
        ...part.attachments.map(({ url }) => url),
      );
      await persist(part, messageId);
    } catch (error) {
      if (!sentCount) throw error;
      return { ...delivery, status: 'partial', error: getErrorMessage(error) };
    }
  }
  return delivery;
};
