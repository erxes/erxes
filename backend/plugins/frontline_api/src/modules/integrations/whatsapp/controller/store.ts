import { normalizePhone } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { receiveInboxMessage } from '~/modules/inbox/receiveMessage';
import { debugError } from '@/integrations/whatsapp/debuggers';
import {
  IWhatsappCustomerDocument,
  IWhatsappIntegrationDocument,
} from '@/integrations/whatsapp/@types';

/**
 * Resolves the WhatsApp sender to a core contact, creating one if needed.
 *
 * Two records are involved: a plugin-local row keyed by `wa_id` for cheap
 * webhook lookups, and the core contact that the inbox actually displays. The
 * phone number is normalised to E.164 before it reaches core so that the same
 * person arriving by WhatsApp and by phone call resolves to ONE contact —
 * core matches `primaryPhone` as an exact string and has no unique index to
 * catch a mismatch.
 *
 * If the core call fails the local row is removed again, so a later retry is
 * not blocked by a half-created customer that has no `erxesApiId`.
 */
export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  integration: IWhatsappIntegrationDocument,
  waId: string,
  displayName?: string,
): Promise<IWhatsappCustomerDocument> => {
  const existing = await models.WhatsappCustomers.findOne({ waId });

  // A row without `erxesApiId` is a half-created customer: the core call either
  // failed or is still in flight. Using it would attach the message to
  // `customerId: undefined`, so treat it as not yet usable.
  if (existing?.erxesApiId) {
    return existing;
  }

  if (existing) {
    throw new Error(
      `WhatsApp customer ${waId} is not linked to a contact yet; retrying`,
    );
  }

  // Meta sends wa_id as E.164 digits with no leading `+`.
  const primaryPhone = normalizePhone(waId, integration.defaultCountryCode);

  let customer: IWhatsappCustomerDocument;

  try {
    customer = await models.WhatsappCustomers.create({
      waId,
      primaryPhone,
      firstName: displayName,
      integrationId: integration.erxesApiId,
    });
  } catch (e) {
    // A concurrent webhook for the same sender won the race. Its row is only
    // usable once that request has linked it to a core contact.
    // 11000 is the reliable duplicate-key signal; the string match is a
    // wording-dependent fallback that must not be the only test.
    if (e.code === 11000 || e.message?.includes('duplicate')) {
      const winner = await models.WhatsappCustomers.getCustomer({ waId });

      if (!winner.erxesApiId) {
        throw new Error(
          `Concurrent request is still creating WhatsApp customer ${waId}`,
        );
      }

      return winner;
    }

    throw e;
  }

  try {
    const response = await receiveInboxMessage(subdomain, {
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        integrationId: integration.erxesApiId,
        primaryPhone,
        firstName: displayName,
        isUser: true,
      }),
    });

    if (response.status !== 'success') {
      throw new Error(
        `Customer creation failed: ${JSON.stringify(response)}`,
      );
    }

    customer.erxesApiId = response.data._id;
    await customer.save();
  } catch (e) {
    await models.WhatsappCustomers.deleteOne({ _id: customer._id });

    throw new Error(`Failed to sync with API: ${e.stack || e.message || e}`);
  }

  return customer;
};

/**
 * Resolves the thread for a sender, creating it on first contact.
 *
 * `lastCustomerMessageAt` is refreshed on every inbound CUSTOMER message
 * because that is what restarts the Cloud API's 24 hour customer service
 * window. Meta also restarts it on an inbound CALL, which this module does not
 * subscribe to, so the stored value can lag behind the real window — which is
 * why the send path treats Meta's own 131047 as the authority rather than
 * relying on this timestamp alone.
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages
 */
export const getOrCreateConversation = async (
  models: IModels,
  subdomain: string,
  integration: IWhatsappIntegrationDocument,
  customer: IWhatsappCustomerDocument,
  waId: string,
  content: string,
  timestamp: Date,
) => {
  const selector = {
    senderId: waId,
    recipientId: integration.phoneNumberId,
  };

  const existing = await models.WhatsappConversations.findOne(selector);

  if (existing) {
    // Meta gives no ordering guarantee, so a redelivered or late webhook can
    // carry an older timestamp than one already recorded. Only ever advance
    // this, otherwise the 24h reply window would move backwards and block
    // replies that are actually still allowed.
    if (
      !existing.lastCustomerMessageAt ||
      timestamp > new Date(existing.lastCustomerMessageAt)
    ) {
      existing.lastCustomerMessageAt = timestamp;
      await existing.save();
    }

    // As with customers, a thread not yet linked to an inbox conversation
    // cannot carry a message — `conversationId` would be undefined.
    if (!existing.erxesApiId) {
      throw new Error(
        `WhatsApp conversation for ${waId} is not linked to the inbox yet; retrying`,
      );
    }

    return existing;
  }

  let conversation;

  try {
    conversation = await models.WhatsappConversations.create({
      ...selector,
      integrationId: integration.erxesApiId,
      content,
      timestamp,
      lastCustomerMessageAt: timestamp,
    });
  } catch (e) {
    // The unique (senderId, recipientId) index rejected a concurrent insert.
    // The winning row is only usable once it has been linked to the inbox.
    // 11000 is the reliable duplicate-key signal; the string match is a
    // wording-dependent fallback that must not be the only test.
    if (e.code === 11000 || e.message?.includes('duplicate')) {
      const winner =
        await models.WhatsappConversations.getConversation(selector);

      if (!winner.erxesApiId) {
        throw new Error(
          `Concurrent request is still creating the WhatsApp conversation for ${waId}`,
        );
      }

      return winner;
    }

    throw e;
  }

  try {
    const response = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId: customer.erxesApiId,
        integrationId: integration.erxesApiId,
        content,
      }),
    });

    if (response.status !== 'success') {
      throw new Error(
        `Conversation creation failed: ${JSON.stringify(response)}`,
      );
    }

    conversation.erxesApiId = response.data._id;
    await conversation.save();
  } catch (e) {
    await models.WhatsappConversations.deleteOne({ _id: conversation._id });

    debugError(`Failed to sync conversation with API: ${e.message}`);

    throw e;
  }

  return conversation;
};
