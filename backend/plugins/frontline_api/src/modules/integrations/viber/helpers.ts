import { generateModels } from '~/connectionResolvers';
import { getViberAccountInfo } from '@/integrations/viber/utils/account';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { randomUUID } from 'node:crypto';
import { receiveInboxMessage } from '@/inbox/receiveMessage';

export const createViberIntegration = async (
  subdomain: string,
  integrationId: string,
  token: string,
): Promise<void> => {
  if (!integrationId.trim()) {
    throw new Error('Integration id is required');
  }

  const models = await generateModels(subdomain);

  const inbox = await models.Integrations.exists({ _id: integrationId });

  if (!inbox) {
    throw new Error('Inbox integration not found');
  }

  const account = await getViberAccountInfo(token);

  const existingIntegration = await models.ViberIntegrations.exists({
    $or: [{ inboxId: integrationId }, { botId: account.id }],
  });

  if (existingIntegration) {
    throw new Error('Viber integration already exists');
  }

  await models.ViberIntegrations.create({
    inboxId: integrationId,
    botId: account.id,
    token,
  });
};

export const removeViberIntegration = async (
  subdomain: string,
  integrationId: string,
): Promise<void> => {
  if (!integrationId.trim()) {
    throw new Error('Integration id is required');
  }

  const models = await generateModels(subdomain);

  await models.ViberIntegrations.deleteOne({
    inboxId: integrationId,
  });
};

export const getOrCreateViberCustomer = async (
  subdomain: string,
  inboxId: string,
  userId: string,
  name?: string,
): Promise<string> => {
  if (!inboxId.trim()) {
    throw new Error('Inbox integration id is required');
  }

  if (!userId.trim()) {
    throw new Error('Viber user id is required');
  }

  const models = await generateModels(subdomain);

  const selector = { inboxId, userId };

  const existingMapping = await models.ViberCustomers.findOne(selector);

  if (existingMapping) {
    return existingMapping.contactsId;
  }

  const customer: unknown = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'customers',
    action: 'createCustomer',
    input: {
      doc: {
        integrationId: inboxId,
        firstName: name?.trim() || undefined,
      },
    },
    throwOnError: true,
  });

  if (
    typeof customer !== 'object' ||
    customer === null ||
    Array.isArray(customer) ||
    !('_id' in customer) ||
    typeof customer._id !== 'string' ||
    customer._id.trim() === ''
  ) {
    throw new Error('Failed to resolve a Core customer for Viber');
  }

  try {
    const mapping = await models.ViberCustomers.create({
      ...selector,
      contactsId: customer._id,
    });

    return mapping.contactsId;
  } catch (error: unknown) {
    if (isViberDuplicateKeyError(error)) {
      const storedMapping = await models.ViberCustomers.findOne(selector);

      if (storedMapping) {
        return storedMapping.contactsId;
      }
    }

    throw error;
  }
};

const isViberDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 11000;

export const getOrCreateViberConversation = async (
  subdomain: string,
  inboxId: string,
  userId: string,
  customerId: string,
  content: string,
): Promise<string> => {
  if (!inboxId.trim()) {
    throw new Error('Inbox integration id is required');
  }

  if (!userId.trim()) {
    throw new Error('Viber user id is required');
  }

  if (!customerId.trim()) {
    throw new Error('Core customer id is required');
  }

  const models = await generateModels(subdomain);
  const selector = { inboxId, userId };
  let mapping = await models.ViberConversations.findOne(selector);

  if (!mapping) {
    try {
      mapping = await models.ViberConversations.create({
        ...selector,
        conversationId: randomUUID(),
      });
    } catch (error: unknown) {
      if (!isViberDuplicateKeyError(error)) {
        throw error;
      }

      mapping = await models.ViberConversations.findOne(selector);

      if (!mapping) {
        throw error;
      }
    }
  }

  const { conversationId } = mapping;

  const syncConversation = async (): Promise<void> => {
    const existing = await models.Conversations.findOne({
      _id: conversationId,
    });

    if (
      existing &&
      (existing.integrationId !== inboxId || existing.customerId !== customerId)
    ) {
      throw new Error('Viber conversation mapping does not match its owner');
    }

    const result = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        conversationId,
        integrationId: inboxId,
        customerId,
        content,
      }),
    });

    if (result.status === 'error') {
      throw new Error(result.errorMessage);
    }

    const data: unknown = result.data;

    if (
      typeof data !== 'object' ||
      data === null ||
      Array.isArray(data) ||
      !('_id' in data) ||
      data._id !== conversationId
    ) {
      throw new Error('Failed to resolve a Frontline conversation for Viber');
    }
  };

  try {
    await syncConversation();
  } catch (error: unknown) {
    if (!isViberDuplicateKeyError(error)) {
      throw error;
    }

    const existing = await models.Conversations.exists({
      _id: conversationId,
      integrationId: inboxId,
      customerId,
    });

    if (!existing) {
      throw error;
    }

    await syncConversation();
  }

  return conversationId;
};
