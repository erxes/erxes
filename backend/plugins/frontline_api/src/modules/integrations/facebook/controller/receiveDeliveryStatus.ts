import { IModels } from '~/connectionResolvers';
import { sanitizeString } from '@/integrations/facebook/controller/receiveMessage';
import { debugFacebook } from '@/integrations/facebook/debuggers';

export type TReceiptKind = 'delivery' | 'read';

const toDate = (value: unknown) => {
  const time = Number(value);

  return Number.isFinite(time) && time > 0 ? new Date(time) : undefined;
};

export const getReceiptKind = (activity: any): TReceiptKind | undefined => {
  if (activity?.delivery) {
    return 'delivery';
  }

  if (activity?.read) {
    return 'read';
  }

  return undefined;
};

/**
 * Meta reports receipts per conversation, not per message: `mids` is optional
 * and the watermark means "everything the page sent up to this point".
 */
export const receiveDeliveryStatus = async (
  models: IModels,
  activity: any,
  kind: TReceiptKind,
): Promise<number> => {
  const pageId = sanitizeString(activity.recipient?.id);
  const userId = sanitizeString(activity.sender?.id);

  if (!pageId || !userId) {
    return 0;
  }

  const conversation = await models.FacebookConversations.findOne({
    senderId: { $eq: userId },
    recipientId: { $eq: pageId },
  });

  if (!conversation) {
    debugFacebook(`No conversation for ${kind} receipt from ${userId}`);
    return 0;
  }

  const receipt = activity[kind];
  const watermark = toDate(receipt?.watermark);
  const occurredAt = toDate(activity.timestamp) || new Date();
  const mids: string[] = Array.isArray(receipt?.mids)
    ? receipt.mids.map((mid: unknown) => sanitizeString(mid)).filter(Boolean)
    : [];

  if (!mids.length && !watermark) {
    return 0;
  }

  const field = kind === 'read' ? 'readAt' : 'deliveredAt';

  // Receipts only cover page-sent messages; inbound ones always have customerId.
  const selector: Record<string, unknown> = {
    conversationId: conversation._id,
    customerId: null,
    [field]: { $exists: false },
    ...(mids.length
      ? { mid: { $in: mids } }
      : { createdAt: { $lte: watermark } }),
  };

  const { modifiedCount } =
    await models.FacebookConversationMessages.updateMany(selector, {
      $set: { [field]: occurredAt },
    });

  return modifiedCount;
};
