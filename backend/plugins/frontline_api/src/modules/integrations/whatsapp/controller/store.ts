import { mongo } from 'mongoose';
import { z } from 'zod';
import type { IAttachment } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import {
  IWhatsappContact,
  IWhatsappCustomerDocument,
} from '@/integrations/whatsapp/@types/customers';
import {
  WHATSAPP_CONVERSATION_PREFIX,
  WHATSAPP_CUSTOMER_PREFIX,
  WHATSAPP_MESSAGE_PREFIX,
} from '@/integrations/whatsapp/constants';

const entityIdSchema = z.object({ _id: z.string().min(1) });

const isDuplicateKeyError = (error: unknown) =>
  error instanceof mongo.MongoServerError && error.code === 11000;

/** One inbox conversation per contact; the id is stable so retries converge. */
export const getWhatsappConversationId = (customerId: string) =>
  `${WHATSAPP_CONVERSATION_PREFIX}${customerId}`;

export const getWhatsappCustomerIdFromConversation = (
  conversationId: string,
): string | undefined =>
  conversationId.startsWith(WHATSAPP_CONVERSATION_PREFIX)
    ? conversationId.slice(WHATSAPP_CONVERSATION_PREFIX.length)
    : undefined;

export const getWhatsappInboxMessageId = (wamid: string) =>
  `${WHATSAPP_MESSAGE_PREFIX}${wamid}`;

/** Core customer id derived from the contact, so retries and races converge on one contact. */
export const getWhatsappCoreCustomerId = (customerId: string) =>
  `${WHATSAPP_CUSTOMER_PREFIX}${customerId}`;

const findCoreCustomer = async (
  subdomain: string,
  query: Record<string, string>,
): Promise<string | undefined> => {
  const found: unknown = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'findOne',
    input: { query },
    defaultValue: null,
  });
  const parsed = entityIdSchema.safeParse(found);

  return parsed.success ? parsed.data._id : undefined;
};

/**
 * Finds or creates the contact's core customer: its stable id first, then an
 * existing customer with the same phone, otherwise a new one with the stable
 * id. A create that loses a race recovers the winner by that id.
 */
const resolveCoreCustomer = async (
  subdomain: string,
  integrationId: string,
  customer: IWhatsappCustomerDocument,
): Promise<string> => {
  const stableId = getWhatsappCoreCustomerId(customer._id);
  const primaryPhone = customer.waId ? `+${customer.waId}` : undefined;

  const existing =
    (await findCoreCustomer(subdomain, { _id: stableId })) ||
    (primaryPhone
      ? await findCoreCustomer(subdomain, {
          customerPrimaryPhone: primaryPhone,
        })
      : undefined);

  if (existing) return existing;

  let response: Awaited<ReturnType<typeof receiveInboxMessage>>;

  try {
    response = await receiveInboxMessage(subdomain, {
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        _id: stableId,
        integrationId,
        firstName: customer.name || primaryPhone || 'WhatsApp contact',
        primaryPhone,
        isUser: true,
      }),
    });
  } catch (error) {
    const recovered = await findCoreCustomer(subdomain, { _id: stableId });

    if (recovered) return recovered;

    throw error;
  }

  if (response.status !== 'success') {
    const recovered = await findCoreCustomer(subdomain, { _id: stableId });

    if (recovered) return recovered;

    throw new Error(`Customer creation failed: ${response.errorMessage}`);
  }

  const created = entityIdSchema.safeParse(response.data);

  if (!created.success) {
    throw new Error('Core did not return a valid customer id');
  }

  return created.data._id;
};

/**
 * Resolves the WhatsApp contact and its core customer. An existing core
 * customer with the same phone is reused untouched, so CRM names survive.
 */
export const getOrCreateWhatsappCustomer = async ({
  models,
  subdomain,
  integrationId,
  contact,
}: {
  models: IModels;
  subdomain: string;
  integrationId: string;
  contact: IWhatsappContact;
}): Promise<IWhatsappCustomerDocument & { erxesApiId: string }> => {
  const customer = await models.WhatsappCustomers.upsertContact(
    integrationId,
    contact,
  );

  if (customer.erxesApiId) {
    return customer as IWhatsappCustomerDocument & { erxesApiId: string };
  }

  const coreCustomerId = await resolveCoreCustomer(
    subdomain,
    integrationId,
    customer,
  );

  // A concurrent webhook may have linked the contact first; keep its link.
  await models.WhatsappCustomers.updateOne(
    { _id: customer._id, erxesApiId: { $exists: false } },
    { $set: { erxesApiId: coreCustomerId } },
  );

  const linked = await models.WhatsappCustomers.findOne({ _id: customer._id });

  if (!linked?.erxesApiId) {
    throw new Error('Could not link the WhatsApp contact to a customer');
  }

  return linked as IWhatsappCustomerDocument & { erxesApiId: string };
};

/** Creates the contact's inbox conversation once; later messages reopen it. */
export const ensureWhatsappConversation = async ({
  models,
  subdomain,
  integrationId,
  customer,
  content,
  createdAt,
}: {
  models: IModels;
  subdomain: string;
  integrationId: string;
  customer: IWhatsappCustomerDocument & { erxesApiId: string };
  content: string;
  createdAt: Date;
}): Promise<string> => {
  const conversationId = getWhatsappConversationId(customer._id);

  if (await models.Conversations.exists({ _id: conversationId })) {
    return conversationId;
  }

  try {
    const response = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        conversationId,
        integrationId,
        customerId: customer.erxesApiId,
        content,
        updatedAt: createdAt,
      }),
    });

    if (response.status !== 'success') {
      throw new Error(`Conversation creation failed: ${response.errorMessage}`);
    }
  } catch (error) {
    // A concurrent webhook created it with the same stable id.
    if (!isDuplicateKeyError(error)) throw error;
  }

  return conversationId;
};

/** Inserts the canonical inbox message; returns false when a retry already stored it. */
export const createWhatsappInboxMessage = async ({
  subdomain,
  conversationId,
  customerId,
  wamid,
  type,
  content,
  attachments,
  createdAt,
}: {
  subdomain: string;
  conversationId: string;
  customerId: string;
  wamid: string;
  type: string;
  content: string;
  attachments: IAttachment[];
  createdAt: Date;
}): Promise<boolean> => {
  try {
    const response = await receiveInboxMessage(subdomain, {
      action: 'create-conversation-message',
      metaInfo: 'replaceContent',
      payload: JSON.stringify({
        _id: getWhatsappInboxMessageId(wamid),
        conversationId,
        customerId,
        content,
        attachments,
        createdAt,
        extraData: { whatsapp: { messageId: wamid, type } },
      }),
    });

    if (response.status !== 'success') {
      throw new Error(`Message creation failed: ${response.errorMessage}`);
    }

    return true;
  } catch (error) {
    if (isDuplicateKeyError(error)) return false;

    throw error;
  }
};
