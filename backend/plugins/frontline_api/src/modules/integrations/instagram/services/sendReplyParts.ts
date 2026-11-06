import type { IAttachment } from '../@types/utils';
import { getErrorMessage } from '@/integrations/utils';

export interface InstagramReplyPart {
  content: string;
  attachments: IAttachment[];
}

export interface InstagramReplyDelivery {
  status: 'sent' | 'partial';
  textSent: boolean;
  sentAttachmentUrls: string[];
  error?: string;
}

export const sendInstagramReplyParts = async (
  parts: InstagramReplyPart[],
  handlers: {
    send: (part: InstagramReplyPart) => Promise<string>;
    persist: (part: InstagramReplyPart, messageId: string) => Promise<void>;
  },
): Promise<InstagramReplyDelivery> => {
  if (!parts.length) throw new Error('Content or attachments are required');
  const delivery: InstagramReplyDelivery = {
    status: 'sent',
    textSent: false,
    sentAttachmentUrls: [],
  };
  let sentCount = 0;

  for (const part of parts) {
    try {
      const messageId = await handlers.send(part);
      if (!messageId) throw new Error('Instagram returned no message ID');
      // As in Facebook, an acknowledged part must not be retried even when
      // saving its provider history fails afterwards.
      sentCount += 1;
      delivery.textSent ||= Boolean(part.content);
      delivery.sentAttachmentUrls.push(
        ...part.attachments.map(({ url }) => url),
      );
      await handlers.persist(part, messageId);
    } catch (error) {
      if (!sentCount) throw error;
      return { ...delivery, status: 'partial', error: getErrorMessage(error) };
    }
  }
  return delivery;
};
