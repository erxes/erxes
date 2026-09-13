import { generateModels } from '~/connectionResolvers';
import { getViberAccountInfo } from '@/integrations/viber/utils/account';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

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
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      const storedMapping = await models.ViberCustomers.findOne(selector);

      if (storedMapping) {
        return storedMapping.contactsId;
      }
    }

    throw error;
  }
};
