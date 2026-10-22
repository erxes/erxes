import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import {
  WHATSAPP_ERROR_CODES,
  WHATSAPP_STATUS_RETRY_DELAYS_MS,
} from '@/integrations/whatsapp/constants';
import { getWhatsappConversationId } from '@/integrations/whatsapp/controller/store';
import { whatsappTextToHtml } from '@/integrations/whatsapp/utils/content';
import { isWhatsappReplyInFlight } from '@/integrations/whatsapp/utils/inFlight';
import { WhatsappWebhookStatus } from '@/integrations/whatsapp/utils/payload';

type TrackedStatus = 'sent' | 'delivered' | 'read';

/** A status may only move forward; each lists the states it may replace. */
const REPLACEABLE: Record<TrackedStatus, (string | null)[]> = {
  sent: [null],
  delivered: [null, 'sent'],
  read: [null, 'sent', 'delivered'],
};

const isTrackedStatus = (status: string): status is TrackedStatus =>
  status in REPLACEABLE;

export const describeWhatsappFailure = (status: WhatsappWebhookStatus) => {
  const error = status.errors?.[0];

  if (error?.code === WHATSAPP_ERROR_CODES.OUTSIDE_SERVICE_WINDOW) {
    return 'WhatsApp did not deliver this reply: more than 24 hours have passed since the customer last wrote. Ask them to message you first, or use an approved template from WhatsApp Manager.';
  }

  if (error?.code === WHATSAPP_ERROR_CODES.PAYMENT_METHOD) {
    return 'WhatsApp did not deliver this reply: the WhatsApp Business Account has no valid payment method. Add one in WhatsApp Manager.';
  }

  const reason =
    error?.error_data?.details ||
    error?.message ||
    error?.title ||
    'unknown error';

  return `WhatsApp did not deliver this reply: ${reason}${
    error?.code ? ` (code ${error.code})` : ''
  }.`;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Loads the reply a status belongs to. A reply erxes just sent may not be
 * stored yet: wait briefly, then throw so the webhook fails and Meta
 * redelivers. A status for a message erxes never sent is ignored.
 */
const findStatusReply = async ({
  models,
  subdomain,
  conversationId,
  wamid,
}: {
  models: IModels;
  subdomain: string;
  conversationId: string;
  wamid: string;
}) => {
  const find = () =>
    models.ConversationMessages.findOne({
      conversationId,
      'extraData.whatsapp.messageIds': wamid,
    }).lean();

  const message = await find();

  if (message || !(await isWhatsappReplyInFlight(subdomain, wamid))) {
    return message;
  }

  for (const delay of WHATSAPP_STATUS_RETRY_DELAYS_MS) {
    await wait(delay);

    const stored = await find();

    if (stored) return stored;
  }

  throw new Error(`WhatsApp reply ${wamid} is not stored yet`);
};

/** Applies a sent/delivered/read/failed status to the agent reply it belongs to. */
export const receiveWhatsappStatus = async ({
  models,
  subdomain,
  integrationId,
  status,
}: {
  models: IModels;
  subdomain: string;
  integrationId: string;
  status: WhatsappWebhookStatus;
}): Promise<void> => {
  if (!status.recipient_id && !status.recipient_user_id) return;

  const customer = await models.WhatsappCustomers.findContact(integrationId, {
    waId: status.recipient_id,
    userId: status.recipient_user_id,
  });

  if (!customer) return;

  const conversationId = getWhatsappConversationId(customer._id);
  const message = await findStatusReply({
    models,
    subdomain,
    conversationId,
    wamid: status.id,
  });

  if (!message) return;

  if (status.status === 'failed') {
    const marked = await models.ConversationMessages.updateOne(
      { _id: message._id, 'extraData.whatsapp.failed': { $ne: true } },
      { $set: { 'extraData.whatsapp.failed': true } },
    );

    if (!marked.modifiedCount) return;

    const note = await models.ConversationMessages.createMessage({
      conversationId,
      internal: true,
      userId: message.userId,
      content: whatsappTextToHtml(describeWhatsappFailure(status)),
    });

    await pConversationClientMessageInserted(subdomain, note);

    return;
  }

  if (!isTrackedStatus(status.status)) return;

  const updated = await models.ConversationMessages.updateOne(
    { _id: message._id, deliveryStatus: { $in: REPLACEABLE[status.status] } },
    { $set: { deliveryStatus: status.status } },
  );

  if (!updated.modifiedCount) return;

  await graphqlPubsub.publish(
    `conversationMessageUpdated:${subdomain}:${conversationId}`,
    {
      conversationMessageUpdated: {
        ...message,
        deliveryStatus: status.status,
        conversationId,
      },
    },
  );
};
