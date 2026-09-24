import { resetConfigsCache } from 'erxes-api-shared/utils';
import {
  getWhatsappPhoneNumbers,
  registerWhatsappPhoneNumber,
  subscribeWabaToApp,
  unsubscribeWabaFromApp,
} from '@/integrations/whatsapp/utils';
import { debugError } from '@/integrations/whatsapp/debuggers';
import { generateModels } from '~/connectionResolvers';

interface IWhatsappCreateData {
  pageId?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
}

const DUPLICATE_PHONE_ERROR =
  'A WhatsApp integration for this phone number already exists';

export const updateConfigs = async (
  subdomain: string,
  configsMap: Record<string, unknown>,
): Promise<void> => {
  const models = await generateModels(subdomain);

  await models.WhatsappConfigs.updateConfigs(configsMap);
  await resetConfigsCache();
};

const assertPhoneReady = async (
  accessToken: string,
  businessAccountId: string,
  phoneNumberId: string,
): Promise<void> => {
  const phoneNumbers = await getWhatsappPhoneNumbers(
    accessToken,
    businessAccountId,
  );

  const selectedPhoneNumber = phoneNumbers.find(
    (phoneNumber) => phoneNumber.id === phoneNumberId,
  );

  if (!selectedPhoneNumber) {
    throw new Error(
      'Phone number does not belong to the selected WhatsApp Business Account',
    );
  }

  if (selectedPhoneNumber.status !== 'CONNECTED') {
    if (selectedPhoneNumber.isOnBizApp) {
      throw new Error(
        `WhatsApp phone number ${
          selectedPhoneNumber.displayPhoneNumber || phoneNumberId
        } is linked to the WhatsApp Business mobile app. App-linked numbers cannot be registered through the API — connect it through Meta's Embedded Signup (App Dashboard → WhatsApp → API Setup → Add phone number) and approve the QR link in the WhatsApp Business app first, then retry.`,
      );
    }

    try {
      await registerWhatsappPhoneNumber(accessToken, phoneNumberId);
    } catch (e) {
      throw new Error(
        `WhatsApp phone number ${
          selectedPhoneNumber.displayPhoneNumber || phoneNumberId
        } is not connected to the Cloud API (status: ${
          selectedPhoneNumber.status || 'unknown'
        }). Register it in WhatsApp Manager first, then retry. ${e.message}`,
      );
    }
  }
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
  const { phoneNumberId, businessAccountId, pageId } = parsedData;

  if (!accountId) {
    throw new Error('Facebook account is required');
  }

  if (!phoneNumberId) {
    throw new Error('phoneNumberId is required');
  }

  if (!businessAccountId) {
    throw new Error('businessAccountId is required');
  }

  const duplicatePhone = await models.WhatsappIntegrations.findOne({
    phoneNumberId,
    erxesApiId: { $ne: integrationId },
  });

  if (duplicatePhone) {
    throw new Error(DUPLICATE_PHONE_ERROR);
  }

  const account = await models.FacebookAccounts.findOne({ _id: accountId });

  if (!account) {
    throw new Error('Facebook account not found');
  }

  const accessToken = account.token;

  await assertPhoneReady(accessToken, businessAccountId, phoneNumberId);

  await subscribeWabaToApp(accessToken, businessAccountId);

  try {
    await models.WhatsappIntegrations.create({
      kind,
      erxesApiId: integrationId,
      accountId,
      phoneNumberId,
      accessToken,
      businessAccountId,
      pageId,
      healthStatus: 'healthy',
      error: '',
    });
  } catch (e) {
    if (e.code === 11000) {
      throw new Error(DUPLICATE_PHONE_ERROR);
    }

    throw e;
  }

  return { status: 'success' };
};

export const updateIntegration = async (
  subdomain: string,
  integrationId: string,
  data?: string,
) => {
  const models = await generateModels(subdomain);
  const parsedData = JSON.parse(data || '{}') as IWhatsappCreateData;

  const existing = await models.WhatsappIntegrations.findOne({
    erxesApiId: integrationId,
  });

  if (!existing) {
    throw new Error('Integration not found');
  }

  const $set: Record<string, unknown> = {
    healthStatus: 'healthy',
    error: '',
  };

  if (parsedData.phoneNumberId !== undefined) {
    if (parsedData.phoneNumberId !== existing.phoneNumberId) {
      const duplicatePhone = await models.WhatsappIntegrations.findOne({
        phoneNumberId: parsedData.phoneNumberId,
        erxesApiId: { $ne: integrationId },
      });

      if (duplicatePhone) {
        throw new Error(DUPLICATE_PHONE_ERROR);
      }
    }

    $set.phoneNumberId = parsedData.phoneNumberId;
  }

  if (parsedData.businessAccountId !== undefined) {
    $set.businessAccountId = parsedData.businessAccountId;
  }

  if (parsedData.pageId !== undefined) {
    $set.pageId = parsedData.pageId;
  }

  const nextPhoneId = parsedData.phoneNumberId ?? existing.phoneNumberId;
  const nextWabaId = parsedData.businessAccountId ?? existing.businessAccountId;

  const phoneChanged =
    parsedData.phoneNumberId !== undefined &&
    parsedData.phoneNumberId !== existing.phoneNumberId;
  const wabaChanged =
    parsedData.businessAccountId !== undefined &&
    parsedData.businessAccountId !== existing.businessAccountId;

  if (phoneChanged || wabaChanged) {
    if (!nextPhoneId) {
      throw new Error('phoneNumberId is required');
    }

    if (!nextWabaId) {
      throw new Error('businessAccountId is required');
    }

    if (!existing.accessToken) {
      throw new Error(
        'Stored WhatsApp access token is missing — reconnect the integration',
      );
    }

    await assertPhoneReady(existing.accessToken, nextWabaId, nextPhoneId);
  }

  await models.WhatsappIntegrations.updateOne(
    { erxesApiId: integrationId },
    { $set },
  );

  const integration = await models.WhatsappIntegrations.findOne({
    erxesApiId: integrationId,
  });

  if (integration?.accessToken && integration.businessAccountId) {
    await subscribeWabaToApp(
      integration.accessToken,
      integration.businessAccountId,
    );
  }

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

  const remainingOnWaba = await models.WhatsappIntegrations.countDocuments({
    businessAccountId: integration.businessAccountId,
  });

  if (
    !remainingOnWaba &&
    integration.accessToken &&
    integration.businessAccountId
  ) {
    try {
      await unsubscribeWabaFromApp(
        integration.accessToken,
        integration.businessAccountId,
      );
    } catch (e) {
      debugError(
        `Failed to unsubscribe WABA ${integration.businessAccountId} from app: ${e.message}`,
      );
    }
  }

  return integrationId;
};
