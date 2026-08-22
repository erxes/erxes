import { resetConfigsCache } from 'erxes-api-shared/utils';
import { getWhatsappPhoneNumbers } from '@/integrations/whatsapp/utils';
import { generateModels } from '~/connectionResolvers';

interface IWhatsappCreateData {
  pageId?: string;
  phoneNumberId?: string;
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
    accountId,
    data,
    kind,
  }: {
    integrationId: string;
    accountId?: string;
    data?: string;
    kind: string;
  },
): Promise<{ status: 'success' }> => {
  const models = await generateModels(subdomain);
  const parsedData = JSON.parse(data || '{}') as IWhatsappCreateData;
  const { phoneNumberId, businessAccountId, pageId, verifyToken } = parsedData;

  if (!accountId) {
    throw new Error('Facebook account is required');
  }

  if (!phoneNumberId) {
    throw new Error('phoneNumberId is required');
  }

  if (!businessAccountId) {
    throw new Error('businessAccountId is required');
  }

  const account = await models.FacebookAccounts.findOne({ _id: accountId });

  if (!account) {
    throw new Error('Facebook account not found');
  }

  const accessToken = account.token;

  // Validate client-provided ids against the authenticated Meta context:
  // the phone number must belong to the selected WhatsApp Business Account.
  const phoneNumbers = await getWhatsappPhoneNumbers(
    accessToken,
    businessAccountId,
  );

  if (!phoneNumbers.some((phoneNumber) => phoneNumber.id === phoneNumberId)) {
    throw new Error(
      'Phone number does not belong to the selected WhatsApp Business Account',
    );
  }

  await models.WhatsappIntegrations.create({
    kind,
    erxesApiId: integrationId,
    phoneNumberId,
    accessToken,
    businessAccountId,
    pageId,
    verifyToken,
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
