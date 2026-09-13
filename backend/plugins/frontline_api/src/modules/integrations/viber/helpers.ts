import { generateModels } from '~/connectionResolvers';
import { getViberAccountInfo } from '@/integrations/viber/utils/account';
import { sendTRPCMessage, uploadFileToStorage } from 'erxes-api-shared/utils';
import { promises as fsPromises } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { MAX_VIBER_FILE_BYTES } from '@/integrations/viber/constants';
import { randomUUID } from 'node:crypto';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import type { IViberMessageDocument } from '@/integrations/viber/@types/message';
import { isViberMessageToken } from '@/integrations/viber/utils/webhook';
import type { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { formatViberText } from '@/integrations/viber/utils/content';
import type { IAttachment } from 'erxes-api-shared/core-types';

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
    attachments?: IAttachment[];
  },
): Promise<string> => {
  const { inboxId, userId, messageToken, text, name, attachments = [] } = input;
  const messageText =
    attachments.length > 0 && !text.trim() ? 'Attachment' : text;
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
    const doc = {
      _id: messageId,
      conversationId,
      customerId,
      content,
      attachments,
      internal: false,
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
  },
): Promise<IAttachment> => {
  const { buffer, mimetype } = input;
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

  if (!Buffer.isBuffer(buffer) || buffer.byteLength > MAX_VIBER_FILE_BYTES) {
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
