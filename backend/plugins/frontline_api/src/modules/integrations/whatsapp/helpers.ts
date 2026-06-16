import { resetConfigsCache } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

interface IWhatsappCreateData {
  phoneNumberId?: string;
  accessToken?: string;
  businessAccountId?: string;
  verifyToken?: string;
}

export const updateConfigs = async (
  subdomain: string,
  configsMap: Record<string, unknown>,
): Promise<void> => {
  const models = await generateModels(subdomain);

  await models.WhatsappConfigs.updateConfigs(configsMap);
  await resetConfigsCache();
};

export const whatsappCreateIntegration = async (
  subdomain: string,
  {
    integrationId,
    data,
    kind,
  }: {
    integrationId: string;
    data?: string;
    kind: string;
  },
): Promise<{ status: 'success' }> => {
  const models = await generateModels(subdomain);
  const parsedData = JSON.parse(data || '{}') as IWhatsappCreateData;
  const phoneNumberId = parsedData.phoneNumberId;
  const accessToken = parsedData.accessToken;

  if (!phoneNumberId) {
    throw new Error('phoneNumberId is required');
  }

  if (!accessToken) {
    throw new Error('accessToken is required');
  }

  await models.WhatsappIntegrations.create({
    kind,
    erxesApiId: integrationId,
    phoneNumberId,
    accessToken,
    businessAccountId: parsedData.businessAccountId,
    verifyToken: parsedData.verifyToken,
    healthStatus: 'healthy',
    error: '',
  });

  return { status: 'success' };
};

export const updateIntegration = async (
  subdomain: string,
  integrationId: string,
  data?: string,
) => {
  const models = await generateModels(subdomain);
  const parsedData = JSON.parse(data || '{}') as IWhatsappCreateData;

  await models.WhatsappIntegrations.updateOne(
    { erxesApiId: integrationId },
    {
      $set: {
        ...parsedData,
        healthStatus: 'healthy',
        error: '',
      },
    },
  );

  return { status: 'success' };
};

export const removeIntegration = async (
  subdomain: string,
  integrationId: string,
) => {
  const models = await generateModels(subdomain);
  const integration = await models.WhatsappIntegrations.findOne({
    erxesApiId: integrationId,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const conversationIds = await models.WhatsappConversations.find({
    integrationId: integration._id,
  }).distinct('_id');

  await models.WhatsappCustomers.deleteMany({ integrationId });
  await models.WhatsappConversations.deleteMany({
    integrationId: integration._id,
  });
  await models.WhatsappConversationMessages.deleteMany({
    conversationId: { $in: conversationIds },
  });
  await models.WhatsappIntegrations.deleteOne({ _id: integration._id });

  return integrationId;
};
