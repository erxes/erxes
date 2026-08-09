import { generateModels } from '~/connectionResolvers';
import { graphRequest } from '@/integrations/whatsapp/utils';
import { debugError } from '@/integrations/whatsapp/debuggers';
import { IWhatsappIntegration } from '@/integrations/whatsapp/@types';

interface IWhatsappIntegrationConfig {
  phoneNumberId?: string;
  whatsappBusinessAccountId?: string;
  accessToken?: string;
  appSecret?: string;
  verifyToken?: string;
  defaultCountryCode?: string;
}

const parseConfig = (data: string): IWhatsappIntegrationConfig => {
  try {
    return JSON.parse(data || '{}');
  } catch (e) {
    throw new Error(`Invalid payload format: ${e.message}`);
  }
};

/**
 * Confirms the credentials work before the integration is stored, so a typo in
 * the token surfaces immediately in the connect form rather than as silently
 * undelivered replies later. Meta returns the number's own metadata here.
 */
const verifyCredentials = async (
  accessToken: string,
  phoneNumberId: string,
) => {
  try {
    return await graphRequest<{
      display_phone_number?: string;
      verified_name?: string;
    }>({
      accessToken,
      method: 'GET',
      path: `/${phoneNumberId}`,
    });
  } catch (e) {
    throw new Error(
      `Could not reach WhatsApp with these credentials: ${e.message}`,
    );
  }
};

/**
 * Creates the plugin-local integration once the inbox has created its own.
 *
 * `phoneNumberId` is the routing key for every inbound webhook, so a second
 * integration claiming the same number would make delivery ambiguous; it is
 * rejected up front with a message naming the conflict.
 */
export const whatsappCreateIntegration = async (
  subdomain: string,
  { integrationId, data, kind },
): Promise<{ status: 'success' }> => {
  const models = await generateModels(subdomain);

  const {
    phoneNumberId,
    whatsappBusinessAccountId,
    accessToken,
    appSecret,
    verifyToken,
    defaultCountryCode,
  } = parseConfig(data);

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      'A phone number ID and access token are required to connect WhatsApp',
    );
  }

  const duplicate = await models.WhatsappIntegrations.findOne({
    phoneNumberId,
  });

  if (duplicate) {
    throw new Error(
      'This WhatsApp phone number is already connected to another integration',
    );
  }

  const details = await verifyCredentials(accessToken, phoneNumberId);

  const doc: IWhatsappIntegration = {
    kind,
    erxesApiId: integrationId,
    phoneNumberId,
    whatsappBusinessAccountId,
    displayPhoneNumber: details?.display_phone_number,
    accessToken,
    appSecret,
    verifyToken,
    defaultCountryCode,
  };

  await models.WhatsappIntegrations.create(doc);

  return { status: 'success' };
};

export const whatsappUpdateIntegration = async (
  subdomain: string,
  integrationId: string,
  data: string,
) => {
  const models = await generateModels(subdomain);

  const integration = await models.WhatsappIntegrations.getIntegration({
    erxesApiId: integrationId,
  });

  const config = parseConfig(data);

  const accessToken = config.accessToken || integration.accessToken;
  const phoneNumberId = config.phoneNumberId || integration.phoneNumberId;

  if (phoneNumberId !== integration.phoneNumberId) {
    const duplicate = await models.WhatsappIntegrations.findOne({
      phoneNumberId,
      erxesApiId: { $ne: integrationId },
    });

    if (duplicate) {
      throw new Error(
        'This WhatsApp phone number is already connected to another integration',
      );
    }
  }

  const details = await verifyCredentials(accessToken, phoneNumberId);

  await models.WhatsappIntegrations.updateOne(
    { erxesApiId: integrationId },
    {
      $set: {
        ...config,
        accessToken,
        phoneNumberId,
        displayPhoneNumber: details?.display_phone_number,
        // Credentials were just proven to work; clear any prior failure.
        healthStatus: 'healthy',
        error: '',
      },
    },
  );

  return { status: 'success' };
};

/**
 * Revalidates stored credentials and clears the error state when they work.
 *
 * An expired access token is the usual way a WhatsApp integration breaks, so
 * repairing means proving the token again — there is no page subscription to
 * re-establish as there is for facebook.
 */
export const whatsappRepairIntegration = async (
  subdomain: string,
  integrationId: string,
) => {
  const models = await generateModels(subdomain);

  const integration = await models.WhatsappIntegrations.getIntegration({
    erxesApiId: integrationId,
  });

  try {
    const details = await verifyCredentials(
      integration.accessToken,
      integration.phoneNumberId,
    );

    await models.WhatsappIntegrations.updateOne(
      { erxesApiId: integrationId },
      {
        $set: {
          displayPhoneNumber: details?.display_phone_number,
          healthStatus: 'healthy',
          error: '',
        },
      },
    );

    return { status: 'success' };
  } catch (e) {
    // Record why it is still broken so the settings screen can show it.
    await models.WhatsappIntegrations.updateOne(
      { erxesApiId: integrationId },
      { $set: { healthStatus: 'error', error: e.message } },
    );

    throw e;
  }
};

export const whatsappRemoveIntegration = async (
  subdomain: string,
  integrationId: string,
) => {
  const models = await generateModels(subdomain);

  const integration = await models.WhatsappIntegrations.findOne({
    erxesApiId: integrationId,
  });

  if (!integration) {
    return { status: 'success' };
  }

  const conversations = await models.WhatsappConversations.find(
    { integrationId: integration.erxesApiId },
    { _id: 1 },
  );

  try {
    await models.WhatsappConversationMessages.deleteMany({
      conversationId: { $in: conversations.map((c) => c._id) },
    });
    await models.WhatsappConversations.deleteMany({
      integrationId: integration.erxesApiId,
    });
    await models.WhatsappCustomers.deleteMany({
      integrationId: integration.erxesApiId,
    });
  } catch (e) {
    // The integration itself must still go, otherwise the number stays
    // claimed and cannot be reconnected.
    debugError(
      `Failed to fully clean up WhatsApp integration ${integrationId}: ${e.message}`,
    );
  }

  await models.WhatsappIntegrations.deleteOne({ _id: integration._id });

  return { status: 'success' };
};
