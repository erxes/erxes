import type { IAttachment } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { IWhatsappIntegrationDocument } from '@/integrations/whatsapp/@types/integrations';
import {
  WHATSAPP_KIND,
  WHATSAPP_MEDIA_RETRY_WINDOW_MS,
} from '@/integrations/whatsapp/constants';
import {
  createWhatsappInboxMessage,
  ensureWhatsappConversation,
  getOrCreateWhatsappCustomer,
  getWhatsappInboxMessageId,
} from '@/integrations/whatsapp/controller/store';
import { receiveWhatsappStatus } from '@/integrations/whatsapp/controller/statuses';
import {
  WhatsappGraphError,
  WhatsappMediaTooLargeError,
} from '@/integrations/whatsapp/graphApi';
import {
  describeWhatsappMessage,
  whatsappTextToHtml,
} from '@/integrations/whatsapp/utils/content';
import { storeWhatsappMedia } from '@/integrations/whatsapp/utils/media';
import { forEachSequentially } from '@/integrations/whatsapp/utils/sequence';
import {
  WhatsappWebhookContact,
  WhatsappWebhookPayload,
  whatsappMessageSchema,
  whatsappStatusSchema,
} from '@/integrations/whatsapp/utils/payload';
import { debugWhatsapp } from '@/integrations/whatsapp/debuggers';

type WhatsappChangeValue =
  WhatsappWebhookPayload['entry'][number]['changes'][number]['value'];

const toDate = (timestamp?: string) => {
  const seconds = Number(timestamp);

  return Number.isFinite(seconds) && seconds > 0
    ? new Date(seconds * 1000)
    : new Date();
};

const findContact = (
  contacts: WhatsappWebhookContact[] | undefined,
  from?: string,
  fromUserId?: string,
) =>
  contacts?.find(
    (contact) =>
      (from && contact.wa_id === from) ||
      (fromUserId && contact.user_id === fromUserId),
  ) ?? contacts?.[0];

/** Too large, or rejected by Meta with a 4xx other than 429: retrying will not help. */
const isLastingMediaError = (error: unknown) =>
  error instanceof WhatsappMediaTooLargeError ||
  (error instanceof WhatsappGraphError &&
    !!error.httpStatus &&
    error.httpStatus < 500 &&
    error.httpStatus !== 429);

/**
 * Stores one inbound message. A media failure that may pass throws, so Meta
 * redelivers and the download runs again; a lasting one, or one still
 * failing an hour after the message, becomes a visible note instead.
 */
export const receiveWhatsappMessage = async ({
  models,
  subdomain,
  connection,
  rawMessage,
  contacts,
}: {
  models: IModels;
  subdomain: string;
  connection: IWhatsappIntegrationDocument & { erxesApiId: string };
  rawMessage: unknown;
  contacts?: WhatsappWebhookContact[];
}): Promise<boolean> => {
  const parsed = whatsappMessageSchema.safeParse(rawMessage);

  if (!parsed.success) {
    debugWhatsapp('Skipped a malformed WhatsApp message webhook item');
    return false;
  }

  const message = parsed.data;
  const described = describeWhatsappMessage(message);

  if (!described) return false;

  if (
    await models.ConversationMessages.exists({
      _id: getWhatsappInboxMessageId(message.id),
    })
  ) {
    return false;
  }

  const contact = findContact(contacts, message.from, message.from_user_id);
  const waId = contact?.wa_id || message.from;
  const userId = contact?.user_id || message.from_user_id;

  if (!waId && !userId) {
    debugWhatsapp('Skipped a WhatsApp message without a sender');
    return false;
  }

  const integrationId = connection.erxesApiId;
  const createdAt = toDate(message.timestamp);
  let text = described.text;
  const attachments: IAttachment[] = [];

  if (described.media) {
    try {
      attachments.push(
        await storeWhatsappMedia({
          subdomain,
          accessToken: connection.accessToken,
          media: described.media,
        }),
      );
    } catch (error) {
      const retry =
        !isLastingMediaError(error) &&
        Date.now() - createdAt.getTime() < WHATSAPP_MEDIA_RETRY_WINDOW_MS;

      if (retry) throw error;

      const reason =
        error instanceof WhatsappMediaTooLargeError
          ? 'it is too large'
          : 'it could not be downloaded';

      text = [text, `[WhatsApp ${described.media.kind} not saved: ${reason}.]`]
        .filter(Boolean)
        .join('\n');
    }
  }

  const content = whatsappTextToHtml(text);
  const customer = await getOrCreateWhatsappCustomer({
    models,
    subdomain,
    integrationId,
    contact: { waId, userId, name: contact?.profile?.name },
  });
  const conversationId = await ensureWhatsappConversation({
    models,
    subdomain,
    integrationId,
    customer,
    content,
    createdAt,
  });

  return createWhatsappInboxMessage({
    subdomain,
    conversationId,
    customerId: customer.erxesApiId,
    wamid: message.id,
    type: message.type,
    content,
    attachments,
    createdAt,
  });
};

/** Routes one `messages` change to its tenant connection; unknown numbers are ignored. */
export const receiveWhatsappChange = async ({
  models,
  subdomain,
  value,
}: {
  models: IModels;
  subdomain: string;
  value: WhatsappChangeValue;
}): Promise<void> => {
  const phoneNumberId = value.metadata?.phone_number_id;

  if (!phoneNumberId) return;

  const connection = await models.WhatsappIntegrations.findOne({
    phoneNumberId,
    erxesApiId: { $exists: true },
  }).select('+accessToken');

  if (!connection?.erxesApiId) return;

  const integration = await models.Integrations.findOne({
    _id: connection.erxesApiId,
    kind: WHATSAPP_KIND,
  }).lean();

  if (!integration || integration.isActive === false) return;

  const attached = connection as IWhatsappIntegrationDocument & {
    erxesApiId: string;
  };

  // In order: a contact's first messages create its customer and conversation.
  await forEachSequentially(value.messages || [], (rawMessage) =>
    receiveWhatsappMessage({
      models,
      subdomain,
      connection: attached,
      rawMessage,
      contacts: value.contacts,
    }),
  );

  const statuses = (value.statuses || []).flatMap((rawStatus) => {
    const status = whatsappStatusSchema.safeParse(rawStatus);

    return status.success ? [status.data] : [];
  });

  await forEachSequentially(statuses, (status) =>
    receiveWhatsappStatus({
      models,
      subdomain,
      integrationId: attached.erxesApiId,
      status,
    }),
  );
};
