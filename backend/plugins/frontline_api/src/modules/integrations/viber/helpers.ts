import { generateModels } from '~/connectionResolvers';
import { getViberAccountInfo } from '@/integrations/viber/utils/account';
import { sendTRPCMessage, uploadFileToStorage } from 'erxes-api-shared/utils';
import { promises as fsPromises } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import {
  VIBER_HEALTH_STATUSES,
  type ViberHealthStatus,
  type ViberMediaType,
} from '@/integrations/viber/constants';
import {
  getViberMediaMaxBytes,
  downloadViberMedia,
} from '@/integrations/viber/utils/media';
import { randomUUID } from 'node:crypto';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import type { IViberMessageDocument } from '@/integrations/viber/@types/message';
import { isViberMessageToken } from '@/integrations/viber/utils/webhook';
import type { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { formatViberText } from '@/integrations/viber/utils/content';
import type { IAttachment } from 'erxes-api-shared/core-types';
import { setViberWebhook } from '@/integrations/viber/utils/webhookApi';
import { getViberWebhookUrl } from '@/integrations/viber/config';
import { isViberDuplicateKeyError } from '@/integrations/viber/utils/errors';

export interface IViberMediaInput {
  source: string;
  fileName: string;
  messageType: ViberMediaType;
  allowedHostnames: readonly string[];
}

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
    name: account.name,
    token,
  });
};

export const registerViberWebhook = async (
  subdomain: string,
  integrationId: string,
): Promise<void> => {
  const callbackUrl = getViberWebhookUrl(subdomain, integrationId);
  const models = await generateModels(subdomain);

  const inbox = await models.Integrations.exists({
    _id: integrationId,
  });

  if (!inbox) {
    throw new Error('Inbox integration not found');
  }

  const integration = await models.ViberIntegrations.findOne({
    inboxId: integrationId,
  }).select('+token');

  if (!integration) {
    throw new Error('Viber integration not found');
  }

  const updateHealth = async (
    healthStatus: ViberHealthStatus,
    error = '',
  ): Promise<void> => {
    const result = await models.ViberIntegrations.updateOne(
      { _id: integration._id, inboxId: integrationId },
      { $set: { healthStatus, error } },
      { runValidators: true },
    );

    if (result.matchedCount !== 1) {
      throw new Error('Viber integration no longer exists');
    }
  };

  await updateHealth(VIBER_HEALTH_STATUSES.PENDING);

  try {
    await setViberWebhook(integration.token, callbackUrl);
  } catch (error) {
    await updateHealth(
      VIBER_HEALTH_STATUSES.UNHEALTHY,
      'Webhook registration could not be confirmed. Check the callback URL and try Repair.',
    );

    throw error;
  }

  await updateHealth(VIBER_HEALTH_STATUSES.HEALTHY);
};

export const removeViberIntegration = async (
  subdomain: string,
  integrationId: string,
): Promise<void> => {
  if (!integrationId.trim()) {
    throw new Error('Integration id is required');
  }

  const models = await generateModels(subdomain);

  const integration = await models.ViberIntegrations.findOne({
    inboxId: integrationId,
  }).select('+token');

  if (!integration) {
    return;
  }

  await setViberWebhook(integration.token, '');

  // Delete only this provider's mappings; native conversation retention belongs
  // to Frontline's common removal flow. Keep credentials until cleanup succeeds.
  const selector = { inboxId: integrationId };
  await models.ViberOutbox.deleteMany(selector);
  await models.ViberReceipts.deleteMany(selector);
  await models.ViberSubscriptions.deleteMany(selector);
  await models.ViberMessages.deleteMany(selector);
  await models.ViberConversations.deleteMany(selector);
  await models.ViberCustomers.deleteMany(selector);

  await models.ViberIntegrations.deleteOne({
    _id: integration._id,
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
  let mapping = await models.ViberCustomers.findOne(selector);

  if (!mapping) {
    try {
      mapping = await models.ViberCustomers.create({
        ...selector,
        contactsId: randomUUID(),
      });
    } catch (error: unknown) {
      if (!isViberDuplicateKeyError(error)) {
        throw error;
      }

      mapping = await models.ViberCustomers.findOne(selector);

      if (!mapping) {
        throw error;
      }
    }
  }

  const { contactsId } = mapping;

  const isExpectedCustomer = (customer: unknown): boolean =>
    typeof customer === 'object' &&
    customer !== null &&
    !Array.isArray(customer) &&
    '_id' in customer &&
    customer._id === contactsId &&
    'integrationId' in customer &&
    customer.integrationId === inboxId;

  const customerExists = async (): Promise<boolean> => {
    const customer: unknown = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: { _id: contactsId },
      defaultValue: null,
      throwOnError: true,
    });

    if (customer === null) {
      return false;
    }

    if (!isExpectedCustomer(customer)) {
      throw new Error('Viber customer mapping does not match its owner');
    }

    return true;
  };

  if (await customerExists()) {
    return contactsId;
  }

  try {
    const customer: unknown = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'customers',
      action: 'createCustomer',
      input: {
        doc: {
          _id: contactsId,
          integrationId: inboxId,
          firstName: name?.trim() || undefined,
        },
      },
      throwOnError: true,
    });

    if (!isExpectedCustomer(customer)) {
      throw new Error('Failed to resolve a Core customer for Viber');
    }
  } catch (error: unknown) {
    if (!(await customerExists())) {
      throw error;
    }
  }

  return contactsId;
};

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

export const getOrCreateViberMessageMapping = async (
  subdomain: string,
  inboxId: string,
  messageToken: string,
): Promise<IViberMessageDocument> => {
  if (!inboxId.trim()) {
    throw new Error('Inbox integration id is required');
  }

  if (!isViberMessageToken(messageToken)) {
    throw new Error('Invalid Viber message token');
  }

  const models = await generateModels(subdomain);
  const selector = { inboxId, messageToken };

  const existingMapping = await models.ViberMessages.findOne(selector);

  if (existingMapping) {
    return existingMapping;
  }

  try {
    return await models.ViberMessages.create({
      ...selector,
      messageId: randomUUID(),
    });
  } catch (error: unknown) {
    if (isViberDuplicateKeyError(error)) {
      const storedMapping = await models.ViberMessages.findOne(selector);

      if (storedMapping) {
        return storedMapping;
      }
    }

    throw error;
  }
};

export const processViberMessage = async (
  subdomain: string,
  input: {
    inboxId: string;
    userId: string;
    messageToken: string;
    text: string;
    name?: string;
    createdAt?: Date;
    attachments?: IAttachment[];
    media?: IViberMediaInput;
  },
): Promise<string> => {
  const {
    inboxId,
    userId,
    messageToken,
    text,
    name,
    attachments = [],
    media,
  } = input;
  const hasAttachments = attachments.length > 0 || Boolean(media);
  const messageText = hasAttachments && !text.trim() ? 'Attachment' : text;
  const content = formatViberText(messageText);

  const mapping = await getOrCreateViberMessageMapping(
    subdomain,
    inboxId,
    messageToken,
  );
  const { messageId } = mapping;

  if (mapping.processedAt) {
    return messageId;
  }

  const customerId = await getOrCreateViberCustomer(
    subdomain,
    inboxId,
    userId,
    name,
  );

  const conversationId = await getOrCreateViberConversation(
    subdomain,
    inboxId,
    userId,
    customerId,
    content,
  );

  const models = await generateModels(subdomain);

  let message: IMessageDocument | null =
    await models.ConversationMessages.findOne({ _id: messageId });

  if (!message) {
    const messageAttachments = [...attachments];

    if (media) {
      const attachment = await downloadAndStoreViberAttachment(
        subdomain,
        media,
      );

      messageAttachments.push(attachment);
    }

    const doc = {
      _id: messageId,
      conversationId,
      customerId,
      content,
      attachments: messageAttachments,
      internal: false,
      ...(input.createdAt ? { createdAt: input.createdAt } : {}),
    };

    try {
      message = await models.ConversationMessages.createMessage(doc);
    } catch (error: unknown) {
      if (!isViberDuplicateKeyError(error)) {
        throw error;
      }

      message = await models.ConversationMessages.findOne({ _id: messageId });

      if (!message) {
        throw error;
      }
    }
  }

  if (
    message._id !== messageId ||
    message.conversationId !== conversationId ||
    message.customerId !== customerId ||
    message.internal ||
    message.userId
  ) {
    throw new Error('Viber message mapping does not match its owner');
  }

  const messageCount = await models.ConversationMessages.countDocuments({
    conversationId,
  });

  // Also repair metadata when an earlier attempt saved the message but failed later.
  await models.Conversations.updateConversation(conversationId, {
    content: message.content,
    messageCount,
    isCustomerRespondedLast: true,
    status: CONVERSATION_STATUSES.OPEN,
    readUserIds: [],
  });

  await pConversationClientMessageInserted(subdomain, message);

  const completion = await models.ViberMessages.updateOne(
    { _id: mapping._id, inboxId, messageToken, messageId },
    { $set: { processedAt: new Date() } },
  );

  if (completion.matchedCount !== 1) {
    throw new Error('Failed to mark Viber message as processed');
  }

  return messageId;
};

export const storeViberAttachment = async (
  subdomain: string,
  input: {
    buffer: Buffer;
    fileName: string;
    mimetype: string;
    messageType: ViberMediaType;
  },
): Promise<IAttachment> => {
  const { buffer, mimetype, messageType } = input;
  const fileName = basename(input.fileName.replace(/\\/g, '/'));

  if (!subdomain.trim()) {
    throw new Error('Subdomain is required');
  }

  if (
    !fileName.trim() ||
    fileName === '.' ||
    fileName === '..' ||
    [...fileName].some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    )
  ) {
    throw new Error('Invalid Viber attachment name');
  }

  if (!mimetype.trim()) {
    throw new Error('Invalid Viber attachment type');
  }

  const maxBytes = getViberMediaMaxBytes(messageType);

  if (!Buffer.isBuffer(buffer) || buffer.byteLength > maxBytes) {
    throw new Error('Invalid Viber attachment size');
  }

  const directory = await fsPromises.mkdtemp(join(tmpdir(), 'viber-'));
  const filePath = join(directory, 'attachment');

  try {
    await fsPromises.writeFile(filePath, new Uint8Array(buffer), {
      mode: 0o600,
    });

    const url = await uploadFileToStorage({
      subdomain,
      filePath,
      fileName,
      mimetype,
      forcePrivate: true,
    });

    if (!url.trim()) {
      throw new Error('Viber attachment storage returned an empty location');
    }

    return {
      name: fileName,
      url,
      size: buffer.byteLength,
      type: mimetype,
    };
  } finally {
    await fsPromises.rm(directory, { recursive: true, force: true });
  }
};

export const downloadAndStoreViberAttachment = async (
  subdomain: string,
  input: IViberMediaInput,
): Promise<IAttachment> => {
  if (!subdomain.trim()) {
    throw new Error('Subdomain is required');
  }

  const { buffer, mimetype } = await downloadViberMedia(
    input.source,
    input.messageType,
    input.allowedHostnames,
  );

  return storeViberAttachment(subdomain, {
    buffer,
    mimetype,
    fileName: input.fileName,
    messageType: input.messageType,
  });
};
